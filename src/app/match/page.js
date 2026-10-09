"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Nav from "@/components/Nav";

export default function MatchFinder() {
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState({ specialty: "", city: "", maxBudget: "", minRating: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hospitals").then((r) => r.json()).then((hospitals) => {
      const all = new Set();
      hospitals.forEach((h) => h.specialties.forEach((s) => all.add(s)));
      setSpecialties(Array.from(all).sort());
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResults(data.matches);
    setLoading(false);
  }

  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";
  const labelClass = "text-sm font-semibold text-[#5B7184] mb-2 block";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Hospital Match</p>
        <h1 className="text-4xl font-extrabold mb-3">Find your best-fit hospital</h1>
        <p className="text-[#5B7184] mb-10">
          Tell us what matters to you — specialty, budget, location, rating — and we&rsquo;ll score and rank hospitals against your preferences, not just filter a list.
        </p>

        <form onSubmit={submit} className="rounded-2xl p-8 wc-card space-y-5 mb-10">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Specialty needed</label>
              <select required className={inputClass} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Preferred city/country (optional)</label>
              <input className={inputClass} placeholder="e.g. Bangalore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Max budget, USD (optional)</label>
              <input type="number" className={inputClass} placeholder="e.g. 8000" value={form.maxBudget} onChange={(e) => setForm({ ...form, maxBudget: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Minimum rating (optional)</label>
              <select className={inputClass} value={form.minRating} onChange={(e) => setForm({ ...form, minRating: e.target.value })}>
                <option value="">Any rating</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
          </div>
          <button disabled={loading} className="w-full btn-grad py-3.5 rounded-xl font-bold disabled:opacity-50">
            {loading ? "Scoring hospitals..." : "Find my matches"}
          </button>
        </form>

        {results && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-[#5B7184] text-sm">No hospitals match that combination yet — try widening your budget or rating filter.</p>
            ) : (
              results.map((m, i) => (
                <motion.div key={m.hospital.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl p-6 wc-card wc-card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{m.hospital.name}</p>
                        {i === 0 && <span className="text-xs font-bold bg-[#2F6FED]/10 text-[#2F6FED] px-2.5 py-1 rounded-full">Best match</span>}
                      </div>
                      <p className="text-[#5B7184] text-sm mt-1">{m.hospital.city}, {m.hospital.country} &middot; {m.hospital.accreditation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-extrabold text-[#2F6FED]">{m.score}</p>
                      <p className="text-[#9AADBD] text-xs">match score</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {m.reasons.map((r) => (
                      <span key={r} className="text-xs bg-[#F7FAFD] border border-[#E3EAF2] px-2.5 py-1 rounded-full text-[#344A61]">{r}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    {m.hospital.rating && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6420]">
                        <Star size={13} className="fill-[#D9A441] text-[#D9A441]" />
                        {m.hospital.rating.toFixed(1)} <span className="text-[#9AADBD] font-normal">({m.hospital.reviewCount})</span>
                      </span>
                    )}
                    <Link href="/case/new" className="text-[#2F6FED] font-semibold text-sm hover:underline">
                      Start a case for this hospital &rarr;
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
