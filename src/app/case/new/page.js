"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";

const STEPS = ["Describe Need", "Preferences", "Review & Submit"];

export default function NewCase() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    countryOfResidence: "",
    preferredDestination: "India",
    condition: "",
    existingTreatment: "",
    budgetRange: "",
    timeline: "",
  });

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e?.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, documents: ["discharge_summary.pdf"] }),
    });
    const created = await res.json();
    router.push(`/case/${created.id}`);
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#4B5D6B] focus:outline-none focus:ring-2 focus:ring-[#8fd6cc] focus:border-transparent transition";
  const labelClass = "text-sm font-semibold text-[#9db3c4] mb-2 block";

  return (
    <main className="min-h-screen bg-[#05090d] text-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 pt-36 pb-20">
        <p className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-2">Create Case</p>
        <h1 className="text-4xl font-extrabold mb-10">Tell us about your condition</h1>

        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= step ? "bg-[#8fd6cc] text-[#0a1c30]" : "bg-white/10 text-[#4B5D6B]"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= step ? "text-white" : "text-[#4B5D6B]"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <motion.form
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={step === STEPS.length - 1 ? submit : (e) => { e.preventDefault(); setStep((s) => s + 1); }}
          className="rounded-2xl p-8 bg-gradient-to-br from-[#101e30] to-[#0a1626] border border-white/5 space-y-5"
        >
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Patient name</label>
                  <input required className={inputClass} value={form.patientName} onChange={(e) => update("patientName", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Country of residence</label>
                  <input required className={inputClass} value={form.countryOfResidence} onChange={(e) => update("countryOfResidence", e.target.value)} placeholder="e.g. UAE" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Condition / diagnosis (as you understand it)</label>
                <textarea required rows={3} className={inputClass} value={form.condition} onChange={(e) => update("condition", e.target.value)} placeholder="e.g. Recommended for coronary bypass surgery by local doctor" />
              </div>
              <div>
                <label className={labelClass}>Existing treatment / diagnosis from your doctor</label>
                <textarea rows={2} className={inputClass} value={form.existingTreatment} onChange={(e) => update("existingTreatment", e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className={labelClass}>Preferred destination</label>
                <input className={inputClass} value={form.preferredDestination} onChange={(e) => update("preferredDestination", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Budget range</label>
                  <input className={inputClass} value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)} placeholder="e.g. $8,000–12,000" />
                </div>
                <div>
                  <label className={labelClass}>Timeline</label>
                  <input className={inputClass} value={form.timeline} onChange={(e) => update("timeline", e.target.value)} placeholder="e.g. Within 4 weeks" />
                </div>
              </div>
              <div className="border border-dashed border-white/15 rounded-xl px-4 py-8 text-center text-sm text-[#4B5D6B]">
                Upload Records (demo &mdash; discharge_summary.pdf attached automatically)
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              <p className="text-[#9db3c4] mb-4">Review before submitting &mdash; this creates your Case ID and Case Room.</p>
              {Object.entries({
                "Patient": form.patientName,
                "From": form.countryOfResidence,
                "Destination": form.preferredDestination,
                "Condition": form.condition,
                "Budget": form.budgetRange || "—",
                "Timeline": form.timeline || "—",
              }).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#9db3c4]">{k}</span>
                  <span className="font-medium text-right max-w-xs">{v}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-6 py-3 rounded-xl font-semibold border border-white/15 hover:bg-white/5 transition">
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#8fd6cc] text-[#0a1c30] py-3 rounded-xl font-bold hover:bg-white transition disabled:opacity-50"
            >
              {step === STEPS.length - 1 ? (submitting ? "Submitting..." : "Submit Case") : "Continue"}
            </button>
          </div>
        </motion.form>
      </div>
    </main>
  );
}
