"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";

const STAGE_COLOR = {
  Submitted: "#5B7184",
  "Under Review": "#8A6420",
  "Sent to Hospitals": "#2F6FED",
  "Quotation Received": "#C23B5A",
  Confirmed: "#1E9E6B",
  Completed: "#1E9E6B",
};

export default function AdminOverview() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("cases");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user || d.user.role !== "admin") {
        router.push("/login?next=/admin");
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      fetch("/api/admin/overview").then((r) => r.json()).then(setData);
    }
  }, [authChecked]);

  async function approveHospital(id) {
    await fetch(`/api/admin/hospitals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    const refreshed = await fetch("/api/admin/overview").then((r) => r.json());
    setData(refreshed);
  }

  if (!authChecked || !data) {
    return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;
  }

  const card = "rounded-2xl p-6 wc-card wc-card-hover";
  const hospitalName = (id) => data.hospitals.find((h) => h.id === id)?.name || id;

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-1">Admin</p>
        <h1 className="text-3xl font-extrabold mb-10">Platform overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total cases", value: data.stats.totalCases },
            { label: "Patients", value: data.stats.totalPatients },
            { label: "Hospitals", value: data.stats.totalHospitals },
            { label: "Quotations", value: data.stats.totalQuotations },
            { label: "Inquiries", value: data.stats.totalInquiries },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={card}>
              <p className="text-3xl font-extrabold text-[#2F6FED]">{s.value}</p>
              <p className="text-sm text-[#5B7184] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          {["cases", "hospitals", "patients", "inquiries", "audit log"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? "wc-gradient text-white" : "bg-[#F7FAFD] text-[#5B7184] hover:bg-[#F3F7FC]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "cases" && (
          <div className="space-y-3">
            {data.cases.length === 0 && <p className="text-[#5B7184] text-sm">No cases yet.</p>}
            {data.cases.map((c) => (
              <div key={c.id} className={`${card} flex items-center justify-between`}>
                <div>
                  <p className="font-bold">{c.patientName}</p>
                  <p className="text-[#5B7184] text-sm mt-1">{c.condition}</p>
                  <p className="text-[#9AADBD] text-xs mt-1">
                    {c.sentToHospitals.length > 0 ? `Sent to ${c.sentToHospitals.map(hospitalName).join(", ")}` : "Not yet sent to a hospital"}
                    {" "}&middot; {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0" style={{ color: STAGE_COLOR[c.stage] || "#5B7184", backgroundColor: "#F3F7FC" }}>
                  {c.stage}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "hospitals" && (
          <div className="grid md:grid-cols-2 gap-4">
            {data.hospitals.map((h) => (
              <div key={h.id} className={card}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{h.name}</p>
                    <p className="text-[#5B7184] text-sm mt-1">{h.city}, {h.country} &middot; {h.accreditation}</p>
                    <p className="text-[#9AADBD] text-xs mt-1">{h.rating ? `Rating ${h.rating} (${h.reviewCount} reviews)` : "No reviews yet"}</p>
                  </div>
                  {h.verified ? (
                    <span className="text-xs font-bold bg-[#1E9E6B]/10 text-[#1E9E6B] px-2.5 py-1 rounded-full shrink-0">Verified</span>
                  ) : (
                    <button
                      onClick={() => approveHospital(h.id)}
                      className="text-xs font-bold bg-[#D9A441]/10 text-[#8A6420] px-3 py-1.5 rounded-full shrink-0 hover:bg-[#D9A441]/20 transition"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "patients" && (
          <div className="space-y-3">
            {data.patients.length === 0 && <p className="text-[#5B7184] text-sm">No patients yet.</p>}
            {data.patients.map((p) => (
              <div key={p.id} className={`${card} flex items-center justify-between`}>
                <div>
                  <p className="font-bold">{p.name || "—"}</p>
                  <p className="text-[#5B7184] text-sm mt-1">{p.email}</p>
                </div>
                <p className="text-[#9AADBD] text-xs">Joined {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "inquiries" && (
          <div className="space-y-3">
            {data.inquiries.length === 0 && <p className="text-[#5B7184] text-sm">No consultation inquiries yet.</p>}
            {data.inquiries.map((inq) => (
              <div key={inq.id} className={card}>
                <div className="flex justify-between">
                  <p className="font-bold">{inq.name || "Anonymous"}</p>
                  <p className="text-[#9AADBD] text-xs">{new Date(inq.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-[#5B7184] text-sm mt-1">{inq.email}</p>
                {inq.message && <p className="text-[#344A61] text-sm mt-2">{inq.message}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === "audit log" && (
          <div className="rounded-2xl wc-card overflow-hidden">
            {data.auditLog.length === 0 ? (
              <p className="text-[#5B7184] text-sm p-6">No audit events recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.auditLog.map((a) => (
                    <tr key={a.id} className="border-b border-[#E3EAF2] last:border-0">
                      <td className="p-4 text-[#344A61] font-medium">{a.action}</td>
                      <td className="p-4 text-[#5B7184]">{a.userEmail}</td>
                      <td className="p-4 text-[#9AADBD] font-mono text-xs">{a.targetId}</td>
                      <td className="p-4 text-[#9AADBD] text-xs whitespace-nowrap">{new Date(a.at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
