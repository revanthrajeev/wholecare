"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function HospitalDashboard() {
  const { hid } = useParams();
  const [data, setData] = useState(null);
  const [hospitals, setHospitals] = useState([]);

  async function load() {
    const [casesRes, hospitalsRes] = await Promise.all([
      fetch(`/api/hospitals/${hid}/cases`),
      fetch(`/api/hospitals`),
    ]);
    setData(await casesRes.json());
    setHospitals(await hospitalsRes.json());
  }

  useEffect(() => {
    load();
  }, [hid]);

  const hospital = hospitals.find((h) => h.id === hid);
  if (!data) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;

  const newCases = data.cases.filter((c) => !data.quotations.some((q) => q.caseId === c.id));
  const quoted = data.cases.filter((c) => data.quotations.some((q) => q.caseId === c.id));
  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-1">Hospital Portal</p>
        <h1 className="text-3xl font-extrabold mb-10">{hospital?.name || "Dashboard"}</h1>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "New cases", value: newCases.length },
            { label: "Quotations submitted", value: quoted.length },
            { label: "Active cases", value: data.cases.length },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={card}>
              <p className="text-3xl font-extrabold text-[#2F6FED]">{s.value}</p>
              <p className="text-sm text-[#5B7184] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="font-bold text-lg mb-4">New Cases</h2>
        {newCases.length === 0 && (
          <p className="text-[#5B7184] text-sm mb-10">No new cases yet. Submit a patient case and send it to this hospital to see it here.</p>
        )}
        <div className="space-y-3 mb-10">
          {newCases.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link href={`/hospital/${hid}/case/${c.id}`} className={`${card} block hover:border-[#2F6FED]/40 transition`}>
                <div className="flex justify-between">
                  <p className="font-bold">{c.patientName}</p>
                  <span className="text-[#8A6420] text-sm font-semibold">Action needed</span>
                </div>
                <p className="text-[#344A61] text-sm mt-1">{c.condition}</p>
                <p className="text-[#5B7184] text-xs mt-1">From {c.countryOfResidence} &middot; Budget {c.budgetRange || "not shared"}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {quoted.length > 0 && (
          <>
            <h2 className="font-bold text-lg mb-4">Quoted Cases</h2>
            <div className="space-y-3">
              {quoted.map((c) => (
                <div key={c.id} className={`${card} opacity-70`}>
                  <p className="font-bold">{c.patientName}</p>
                  <p className="text-[#344A61] text-sm mt-1">{c.condition} &middot; Quotation submitted</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
