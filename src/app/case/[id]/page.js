"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/Nav";

const STAGES = ["Submitted", "Under Review", "Sent to Hospitals", "Quotation Received", "Confirmed", "Completed"];

export default function CaseRoom() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [askText, setAskText] = useState("");
  const [askResult, setAskResult] = useState(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);

  async function load() {
    const res = await fetch(`/api/cases/${id}`);
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!data) return <main className="min-h-screen bg-[#05090d] text-white flex items-center justify-center">Loading case&hellip;</main>;
  if (data.error) return <main className="min-h-screen bg-[#05090d] text-white flex items-center justify-center">Case not found.</main>;

  const { case: c, quotations, hospitals } = data;
  const stageIdx = STAGES.indexOf(c.stage);

  async function generateSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/ai/case-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      setSummary(await res.json());
    } catch (e) {
      setSummaryError("AI assistant is unavailable right now (local model not reachable).");
    }
    setSummaryLoading(false);
  }

  async function organizeQuestions() {
    if (!askText.trim()) return;
    setAskLoading(true);
    setAskError(null);
    try {
      const res = await fetch("/api/ai/organize-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: c.condition, rawQuestions: askText }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "failed");
      setAskResult(await res.json());
    } catch (e) {
      setAskError("AI assistant is unavailable right now (local model not reachable).");
    }
    setAskLoading(false);
  }

  async function sendToHospitals() {
    if (selectedHospitals.length === 0) return;
    setSending(true);
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendToHospitalIds: selectedHospitals }),
    });
    await load();
    setSending(false);
  }

  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-[#05090d] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-1">Case {c.id}</p>
            <h1 className="text-3xl font-extrabold">{c.patientName}&rsquo;s case</h1>
          </div>
          <span className="px-4 py-2 rounded-full bg-[#8fd6cc]/15 text-[#8fd6cc] border border-[#8fd6cc]/30 text-sm font-semibold">
            {c.stage}
          </span>
        </div>

        {/* progress rail */}
        <div className="flex items-center mb-10">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-3 h-3 rounded-full shrink-0 ${i <= stageIdx ? "bg-[#8fd6cc]" : "bg-white/10"}`} />
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < stageIdx ? "bg-[#8fd6cc]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
              <h2 className="font-bold mb-4">Overview</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-[#9db3c4]">Condition</dt><dd className="font-medium mt-0.5">{c.condition}</dd></div>
                <div><dt className="text-[#9db3c4]">From</dt><dd className="font-medium mt-0.5">{c.countryOfResidence}</dd></div>
                <div><dt className="text-[#9db3c4]">Destination</dt><dd className="font-medium mt-0.5">{c.preferredDestination}</dd></div>
                <div><dt className="text-[#9db3c4]">Budget</dt><dd className="font-medium mt-0.5">{c.budgetRange || "—"}</dd></div>
                <div><dt className="text-[#9db3c4]">Timeline</dt><dd className="font-medium mt-0.5">{c.timeline || "—"}</dd></div>
              </dl>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }} className={`${card} border-[#8fd6cc]/20`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8fd6cc] to-[#2E7D78] inline-block" />
                  AI Case Summary
                </h2>
                {!summary && (
                  <button
                    onClick={generateSummary}
                    disabled={summaryLoading}
                    className="text-xs font-bold bg-[#8fd6cc]/15 text-[#8fd6cc] px-4 py-2 rounded-full hover:bg-[#8fd6cc]/25 transition disabled:opacity-50"
                  >
                    {summaryLoading ? "Generating…" : "Generate with AI"}
                  </button>
                )}
              </div>
              {summaryError && <p className="text-sm text-[#C9A66B]">{summaryError}</p>}
              {summary && (
                <div className="space-y-4 text-sm">
                  <p className="text-[#cfe0e8]">{summary.structuredSummary}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">Specialty: {summary.suggestedSpecialty}</span>
                    <span className={`text-xs px-3 py-1.5 rounded-full border ${
                      summary.triagePriority?.includes("Urgent") ? "bg-red-500/10 text-red-300 border-red-500/30" :
                      summary.triagePriority === "Priority" ? "bg-[#C9A66B]/10 text-[#C9A66B] border-[#C9A66B]/30" :
                      "bg-white/5 border-white/10"
                    }`}>
                      Triage: {summary.triagePriority}
                    </span>
                  </div>
                  {summary.missingInformation?.length > 0 && (
                    <div>
                      <p className="text-[#9db3c4] font-semibold mb-1.5">Missing information to request</p>
                      <ul className="list-disc list-inside text-[#cfe0e8] space-y-1">
                        {summary.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  {summary.suggestedQuestionsForDoctor?.length > 0 && (
                    <div>
                      <p className="text-[#9db3c4] font-semibold mb-1.5">Suggested questions for the specialist</p>
                      <ul className="list-disc list-inside text-[#cfe0e8] space-y-1">
                        {summary.suggestedQuestionsForDoctor.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                  <p className="text-[#4B5D6B] text-xs pt-2 border-t border-white/5">
                    AI-generated intake summary for care coordinator review — not a diagnosis. Model: {summary.model}, running locally.
                  </p>
                </div>
              )}
              {!summary && !summaryError && !summaryLoading && (
                <p className="text-[#4B5D6B] text-sm">Have AI organize this case into a structured clinical intake summary, suggested specialty, triage priority and missing-document checklist for the care team.</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={card}>
              <h2 className="font-bold mb-4">Documents</h2>
              <ul className="text-sm space-y-2">
                {c.documents.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-[#9db3c4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8fd6cc]" /> {d}
                  </li>
                ))}
              </ul>
            </motion.div>

            <AnimatePresence mode="wait">
              {c.sentToHospitals.length === 0 ? (
                <motion.div key="send" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
                  <h2 className="font-bold mb-4">Send case to hospitals</h2>
                  <div className="space-y-2 mb-5">
                    {hospitals.map((h) => (
                      <label key={h.id} className="flex items-center gap-3 text-sm p-4 border border-white/10 rounded-xl cursor-pointer hover:border-[#8fd6cc]/40 transition">
                        <input
                          type="checkbox"
                          className="accent-[#8fd6cc]"
                          checked={selectedHospitals.includes(h.id)}
                          onChange={(e) => {
                            setSelectedHospitals((prev) => e.target.checked ? [...prev, h.id] : prev.filter((x) => x !== h.id));
                          }}
                        />
                        <span className="font-semibold">{h.name}</span>
                        <span className="text-[#9db3c4]">&middot; {h.city}, {h.country} &middot; {h.accreditation}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={sendToHospitals}
                    disabled={sending || selectedHospitals.length === 0}
                    className="bg-[#8fd6cc] text-[#0a1c30] px-6 py-3 rounded-xl font-bold hover:bg-white transition disabled:opacity-40"
                  >
                    {sending ? "Sending..." : `Send to ${selectedHospitals.length || ""} hospital(s)`}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="quotes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
                  <h2 className="font-bold mb-4">Quotations ({quotations.length} of {c.sentToHospitals.length})</h2>
                  {quotations.length === 0 ? (
                    <p className="text-sm text-[#9db3c4]">Waiting on hospital response&hellip;</p>
                  ) : (
                    <div className="space-y-3">
                      {quotations.map((q) => {
                        const h = hospitals.find((x) => x.id === q.hospitalId);
                        return (
                          <div key={q.id} className="border border-white/10 rounded-xl p-5 text-sm">
                            <p className="font-bold">{h?.name}</p>
                            <p className="text-[#9db3c4] mt-1">{q.procedure} &middot; Dr. {q.doctor} &middot; {q.hospitalStayDays} days stay</p>
                            <p className="text-[#8fd6cc] font-extrabold text-xl mt-2">{q.estimatedCost}</p>
                          </div>
                        );
                      })}
                      <Link href={`/compare/${c.id}`} className="inline-block mt-2 text-[#8fd6cc] font-semibold hover:underline">
                        Compare all quotations &rarr;
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={card}>
              <h2 className="font-bold mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-gradient-to-br from-[#8fd6cc] to-[#2E7D78] inline-block" />
                Ask the Doctor — organize your questions
              </h2>
              <p className="text-[#4B5D6B] text-sm mb-4">
                Write your questions in your own words. AI organizes them by topic before your consultation — it never answers clinical questions itself.
              </p>
              <textarea
                rows={3}
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                placeholder="e.g. how long will I be in hospital, is it safe for someone my age, can I fly back after 2 weeks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#4B5D6B] focus:outline-none focus:ring-2 focus:ring-[#8fd6cc] mb-3"
              />
              <button
                onClick={organizeQuestions}
                disabled={askLoading || !askText.trim()}
                className="bg-[#8fd6cc]/15 text-[#8fd6cc] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#8fd6cc]/25 transition disabled:opacity-40"
              >
                {askLoading ? "Organizing…" : "Organize my questions"}
              </button>
              {askError && <p className="text-sm text-[#C9A66B] mt-3">{askError}</p>}
              {askResult && (
                <div className="grid sm:grid-cols-2 gap-4 mt-5">
                  {askResult.categories?.map((cat) => (
                    <div key={cat.name} className="border border-white/10 rounded-xl p-4">
                      <p className="text-[#8fd6cc] font-semibold text-sm mb-2">{cat.name}</p>
                      <ul className="text-sm text-[#cfe0e8] space-y-1.5 list-disc list-inside">
                        {cat.questions.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
              <h2 className="font-bold mb-4">Case timeline</h2>
              <ul className="space-y-4 text-sm">
                {c.timeline_events.slice().reverse().map((e, i) => (
                  <li key={i} className="border-l-2 border-[#8fd6cc]/50 pl-3">
                    <p className="font-medium">{e.label}</p>
                    <p className="text-[#4B5D6B] text-xs mt-0.5">{new Date(e.at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
