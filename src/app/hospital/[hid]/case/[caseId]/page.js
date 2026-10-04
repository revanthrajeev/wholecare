"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function HospitalCaseView() {
  const { hid, caseId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    procedure: "",
    doctor: "",
    hospitalStayDays: "",
    estimatedCost: "",
    exclusions: "",
    validityDays: "14",
  });

  useEffect(() => {
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then(setData);
  }, [caseId]);

  if (!data) return <main className="min-h-screen bg-[#05090d] text-white flex items-center justify-center">Loading&hellip;</main>;
  const { case: c } = data;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submitQuote(e) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, caseId, hospitalId: hid }),
    });
    router.push(`/hospital/${hid}`);
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#4B5D6B] focus:outline-none focus:ring-2 focus:ring-[#8fd6cc] focus:border-transparent transition";
  const labelClass = "text-sm font-semibold text-[#9db3c4] mb-2 block";
  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-[#05090d] text-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-1">Case {c.id}</p>
        <h1 className="text-3xl font-extrabold mb-6">{c.patientName}</h1>

        <div className={`${card} mb-8 text-sm space-y-2`}>
          <p><span className="text-[#9db3c4]">Condition:</span> {c.condition}</p>
          <p><span className="text-[#9db3c4]">Existing treatment/diagnosis:</span> {c.existingTreatment || "—"}</p>
          <p><span className="text-[#9db3c4]">From:</span> {c.countryOfResidence}</p>
          <p><span className="text-[#9db3c4]">Budget shared:</span> {c.budgetRange || "not shared"}</p>
          <p><span className="text-[#9db3c4]">Timeline:</span> {c.timeline || "—"}</p>
          <p><span className="text-[#9db3c4]">Documents:</span> {c.documents.join(", ")}</p>
        </div>

        <h2 className="font-bold text-lg mb-4">Submit Quotation</h2>
        <form onSubmit={submitQuote} className={`${card} space-y-4`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Procedure</label>
              <input required className={inputClass} value={form.procedure} onChange={(e) => update("procedure", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Doctor</label>
              <input required className={inputClass} value={form.doctor} onChange={(e) => update("doctor", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estimated hospital stay (days)</label>
              <input className={inputClass} value={form.hospitalStayDays} onChange={(e) => update("hospitalStayDays", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Estimated total cost</label>
              <input required placeholder="$9,500" className={inputClass} value={form.estimatedCost} onChange={(e) => update("estimatedCost", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Exclusions</label>
            <textarea rows={2} className={inputClass} value={form.exclusions} onChange={(e) => update("exclusions", e.target.value)} placeholder="e.g. Travel, medication after discharge" />
          </div>
          <div>
            <label className={labelClass}>Quote validity (days)</label>
            <input className={inputClass} value={form.validityDays} onChange={(e) => update("validityDays", e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8fd6cc] text-[#0a1c30] py-3.5 rounded-xl font-bold hover:bg-white transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Quotation"}
          </button>
        </form>
      </div>
    </main>
  );
}
