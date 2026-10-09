"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, FileText, Stethoscope, ScrollText, Plane, MessageSquare } from "lucide-react";
import Nav from "@/components/Nav";

const STAGES = ["Submitted", "Under Review", "Sent to Hospitals", "Quotation Received", "Confirmed", "Completed"];
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "consultations", label: "Ask the Doctor", icon: Stethoscope },
  { id: "quotations", label: "Quotations", icon: ScrollText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "travel", label: "Travel", icon: Plane },
];

export default function CaseRoom() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [askText, setAskText] = useState("");
  const [askResult, setAskResult] = useState(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [me, setMe] = useState(null);

  async function load() {
    const res = await fetch(`/api/cases/${id}`);
    setData(await res.json());
  }

  async function loadMessages() {
    const res = await fetch(`/api/cases/${id}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    load();
    loadMessages();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
  }, [id]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMessage(true);
    const res = await fetch(`/api/cases/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: messageText }),
    });
    if (res.ok) {
      setMessageText("");
      await loadMessages();
    }
    setSendingMessage(false);
  }

  if (!data) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading case&hellip;</main>;
  if (data.error) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Case not found.</main>;

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
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-1">Case {c.id}</p>
            <h1 className="text-3xl font-extrabold">{c.patientName}&rsquo;s case</h1>
          </div>
          <span className="px-4 py-2 rounded-full bg-[#EAF2FF] text-[#2F6FED] border border-[#2F6FED]/20 text-sm font-semibold">
            {c.stage}
          </span>
        </div>

        {/* progress rail */}
        <div className="flex items-center mb-10">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-3 h-3 rounded-full shrink-0 ${i <= stageIdx ? "bg-[#2F6FED]" : "bg-[#E3EAF2]"}`} />
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < stageIdx ? "bg-[#2F6FED]" : "bg-[#E3EAF2]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    tab === t.id ? "wc-gradient text-white" : "bg-[#F7FAFD] text-[#5B7184] hover:bg-[#F3F7FC]"
                  }`}
                >
                  <t.icon size={14} /> {t.label}
                  {t.id === "quotations" && quotations.length > 0 && (
                    <span className={`ml-1 text-xs rounded-full px-1.5 ${tab === t.id ? "bg-white/25" : "bg-[#2F6FED]/10 text-[#2F6FED]"}`}>{quotations.length}</span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className={card}>
                    <h2 className="font-bold mb-4">Overview</h2>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="text-[#5B7184]">Condition</dt><dd className="font-medium mt-0.5">{c.condition}</dd></div>
                      <div><dt className="text-[#5B7184]">From</dt><dd className="font-medium mt-0.5">{c.countryOfResidence}</dd></div>
                      <div><dt className="text-[#5B7184]">Destination</dt><dd className="font-medium mt-0.5">{c.preferredDestination}</dd></div>
                      <div><dt className="text-[#5B7184]">Budget</dt><dd className="font-medium mt-0.5">{c.budgetRange || "—"}</dd></div>
                      <div><dt className="text-[#5B7184]">Timeline</dt><dd className="font-medium mt-0.5">{c.timeline || "—"}</dd></div>
                    </dl>
                  </div>

                  <div className={card}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md wc-gradient inline-block" />
                        AI Case Summary
                      </h2>
                      {!summary && (
                        <button
                          onClick={generateSummary}
                          disabled={summaryLoading}
                          className="text-xs font-bold bg-[#EAF2FF] text-[#2F6FED] px-4 py-2 rounded-full hover:bg-[#2F6FED]/15 transition disabled:opacity-50"
                        >
                          {summaryLoading ? "Generating…" : "Generate with AI"}
                        </button>
                      )}
                    </div>
                    {summaryError && <p className="text-sm text-[#B8862E]">{summaryError}</p>}
                    {summary && (
                      <div className="space-y-4 text-sm">
                        <p className="text-[#344A61]">{summary.structuredSummary}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-[#F3F7FC] border border-[#E3EAF2] px-3 py-1.5 rounded-full">Specialty: {summary.suggestedSpecialty}</span>
                          <span className={`text-xs px-3 py-1.5 rounded-full border ${
                            summary.triagePriority?.includes("Urgent") ? "bg-[#FF6B81]/10 text-[#C23A52] border-[#FF6B81]/30" :
                            summary.triagePriority === "Priority" ? "bg-[#D9A441]/10 text-[#8A6420] border-[#D9A441]/30" :
                            "bg-[#F3F7FC] border-[#E3EAF2]"
                          }`}>
                            Triage: {summary.triagePriority}
                          </span>
                        </div>
                        {summary.missingInformation?.length > 0 && (
                          <div>
                            <p className="text-[#5B7184] font-semibold mb-1.5">Missing information to request</p>
                            <ul className="list-disc list-inside text-[#344A61] space-y-1">
                              {summary.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        )}
                        {summary.suggestedQuestionsForDoctor?.length > 0 && (
                          <div>
                            <p className="text-[#5B7184] font-semibold mb-1.5">Suggested questions for the specialist</p>
                            <ul className="list-disc list-inside text-[#344A61] space-y-1">
                              {summary.suggestedQuestionsForDoctor.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        )}
                        <p className="text-[#9AADBD] text-xs pt-2 border-t border-[#E3EAF2]">
                          AI-generated intake summary for care coordinator review — not a diagnosis. Model: {summary.model}, running locally.
                        </p>
                      </div>
                    )}
                    {!summary && !summaryError && !summaryLoading && (
                      <p className="text-[#5B7184] text-sm">Have AI organize this case into a structured clinical intake summary, suggested specialty, triage priority and missing-document checklist for the care team.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === "documents" && (
                <motion.div key="documents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                  <h2 className="font-bold mb-4">Documents</h2>
                  <ul className="text-sm space-y-2">
                    {c.documents.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-[#5B7184]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED]" /> {d}
                      </li>
                    ))}
                  </ul>
                  <div className="border border-dashed border-[#D7E2EE] rounded-xl px-4 py-8 text-center text-sm text-[#9AADBD] mt-5">
                    Upload additional records (demo — not wired to storage)
                  </div>
                </motion.div>
              )}

              {tab === "consultations" && (
                <motion.div key="consultations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                  <h2 className="font-bold mb-2 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md wc-gradient inline-block" />
                    Ask the Doctor — organize your questions
                  </h2>
                  <p className="text-[#5B7184] text-sm mb-4">
                    Write your questions in your own words. AI organizes them by topic before your consultation — it never answers clinical questions itself.
                  </p>
                  <textarea
                    rows={3}
                    value={askText}
                    onChange={(e) => setAskText(e.target.value)}
                    placeholder="e.g. how long will I be in hospital, is it safe for someone my age, can I fly back after 2 weeks..."
                    className="w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] mb-3"
                  />
                  <button
                    onClick={organizeQuestions}
                    disabled={askLoading || !askText.trim()}
                    className="bg-[#EAF2FF] text-[#2F6FED] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#2F6FED]/15 transition disabled:opacity-40"
                  >
                    {askLoading ? "Organizing…" : "Organize my questions"}
                  </button>
                  {askError && <p className="text-sm text-[#B8862E] mt-3">{askError}</p>}
                  {askResult && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-5">
                      {askResult.categories?.map((cat) => (
                        <div key={cat.name} className="border border-[#E3EAF2] rounded-xl p-4">
                          <p className="text-[#2F6FED] font-semibold text-sm mb-2">{cat.name}</p>
                          <ul className="text-sm text-[#344A61] space-y-1.5 list-disc list-inside">
                            {cat.questions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/consult" className="mt-5 inline-block text-[#2F6FED] font-semibold text-sm hover:underline">
                    Or book a live video consultation &rarr;
                  </Link>
                </motion.div>
              )}

              {tab === "quotations" && (
                c.sentToHospitals.length === 0 ? (
                  <motion.div key="send" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                    <h2 className="font-bold mb-4">Send case to hospitals</h2>
                    <div className="space-y-2 mb-5">
                      {hospitals.map((h) => (
                        <label key={h.id} className="flex items-center gap-3 text-sm p-4 border border-[#E3EAF2] rounded-xl cursor-pointer hover:border-[#2F6FED]/40 transition">
                          <input
                            type="checkbox"
                            className="accent-[#2F6FED]"
                            checked={selectedHospitals.includes(h.id)}
                            onChange={(e) => {
                              setSelectedHospitals((prev) => e.target.checked ? [...prev, h.id] : prev.filter((x) => x !== h.id));
                            }}
                          />
                          <span className="font-semibold">{h.name}</span>
                          <span className="text-[#5B7184]">&middot; {h.city}, {h.country} &middot; {h.accreditation}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={sendToHospitals}
                      disabled={sending || selectedHospitals.length === 0}
                      className="btn-grad px-6 py-3 rounded-xl font-bold disabled:opacity-40"
                    >
                      {sending ? "Sending..." : `Send to ${selectedHospitals.length || ""} hospital(s)`}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="quotes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                    <h2 className="font-bold mb-4">Quotations ({quotations.length} of {c.sentToHospitals.length})</h2>
                    {quotations.length === 0 ? (
                      <p className="text-sm text-[#5B7184]">Waiting on hospital response&hellip;</p>
                    ) : (
                      <div className="space-y-3">
                        {quotations.map((q) => {
                          const h = hospitals.find((x) => x.id === q.hospitalId);
                          return (
                            <div key={q.id} className="border border-[#E3EAF2] rounded-xl p-5 text-sm">
                              <p className="font-bold">{h?.name}</p>
                              <p className="text-[#5B7184] mt-1">{q.procedure} &middot; Dr. {q.doctor} &middot; {q.hospitalStayDays} days stay</p>
                              <p className="text-[#2F6FED] font-extrabold text-xl mt-2">{q.estimatedCost}</p>
                            </div>
                          );
                        })}
                        <Link href={`/compare/${c.id}`} className="inline-block mt-2 text-[#2F6FED] font-semibold hover:underline">
                          Compare all quotations &rarr;
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )
              )}

              {tab === "messages" && (
                <motion.div key="messages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                  <h2 className="font-bold mb-4">Messages</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                    {messages.length === 0 ? (
                      <p className="text-[#9AADBD] text-sm">No messages yet. Hospitals you&rsquo;ve sent this case to can message you here.</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.senderId === me?.id ? "ml-auto bg-[#2F6FED] text-white" : "bg-[#F3F7FC] text-[#344A61]"}`}>
                          <p className={`text-xs font-semibold mb-0.5 ${m.senderId === me?.id ? "text-white/80" : "text-[#5B7184]"}`}>{m.senderLabel}</p>
                          <p>{m.text}</p>
                          <p className={`text-[10px] mt-1 ${m.senderId === me?.id ? "text-white/60" : "text-[#9AADBD]"}`}>{new Date(m.at).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {c.sentToHospitals.length === 0 ? (
                    <p className="text-[#9AADBD] text-xs">Send your case to a hospital before starting a conversation.</p>
                  ) : (
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
                      />
                      <button disabled={sendingMessage || !messageText.trim()} className="btn-grad px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                        Send
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {tab === "travel" && (
                <motion.div key="travel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={card}>
                  <h2 className="font-bold mb-2">Travel coordination</h2>
                  {c.stage === "Confirmed" || c.stage === "Completed" ? (
                    <p className="text-[#5B7184] text-sm">Visa, flights and hotel coordination unlock once your treatment is confirmed with a hospital.</p>
                  ) : (
                    <p className="text-[#5B7184] text-sm">Travel planning (visa checklist, flights, hotel, airport pickup) becomes available after you confirm a quotation. Compare quotations in the Quotations tab to move your case forward.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
              <h2 className="font-bold mb-4">Case timeline</h2>
              <ul className="space-y-4 text-sm">
                {c.timeline_events.slice().reverse().map((e, i) => (
                  <li key={i} className="border-l-2 border-[#2F6FED]/40 pl-3">
                    <p className="font-medium">{e.label}</p>
                    <p className="text-[#9AADBD] text-xs mt-0.5">{new Date(e.at).toLocaleString()}</p>
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
