"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ClipboardList, FileText, ReceiptText, MessageSquare, Plane, HeartPulse, StickyNote, FileCheck2, Flag, ExternalLink } from "lucide-react";
import { Badge, Button, EmptyState, Select, Textarea, cn, formatDate, formatDateTime, buttonClass } from "@/components/ui/core";
import { Tabs } from "@/components/ui/client";
import { useCase } from "@/components/case/useCase";
import DocumentsPanel from "@/components/case/DocumentsPanel";
import MessagesPanel from "@/components/case/MessagesPanel";
import TravelTab from "@/components/case/TravelTab";
import RecoveryTab from "@/components/case/RecoveryTab";
import QuoteBuilder from "@/components/hospital/QuoteBuilder";
import { HOSPITAL_PIPELINE, HOSPITAL_UPDATES } from "@/lib/constants";
import { treatmentBySlug } from "@/content/treatments";

function CaseInfo({ data, act }) {
  const c = data.case;
  const t = treatmentBySlug(c.treatmentSlug);
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <p className="font-bold text-ink-900">Patient-reported details</p>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {[
            ["Patient", `${c.patientName}${c.patientAge ? `, ${c.patientAge}` : ""}`],
            ["Country", c.countryOfResidence || "—"],
            ["Requested", t?.name || c.specialty || "—"],
            ["Destination", c.preferredDestination || "—"],
            ["Budget", c.budgetRange || "Not shared"],
            ["Timing", c.timeline || "Flexible"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-ink-500">{k}</dt>
              <dd className="text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 space-y-3 text-sm">
          <div>
            <p className="text-xs text-ink-500">Condition</p>
            <p className="whitespace-pre-line text-ink-900">{c.condition}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Care so far</p>
            <p className="whitespace-pre-line text-ink-900">{c.existingTreatment || "—"}</p>
          </div>
          {c.questions && (
            <div>
              <p className="text-xs text-ink-500">Questions for the specialist</p>
              <p className="whitespace-pre-line text-ink-900">{c.questions}</p>
            </div>
          )}
        </div>
      </section>
      {c.aiSummary && (
        <section className="card p-6">
          <p className="font-bold text-ink-900">Intake summary</p>
          <p className="mt-2 text-sm text-ink-700">{c.aiSummary.structuredSummary}</p>
          {c.aiSummary.missingInformation?.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">Missing information</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-700">
                {c.aiSummary.missingInformation.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
      {c.questionList?.categories?.length > 0 && (
        <section className="card p-6">
          <p className="font-bold text-ink-900">Patient&rsquo;s questions for the consult</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {c.questionList.categories.map((cat) => (
              <div key={cat.name} className="rounded-2xl bg-ink-50 p-4">
                <p className="text-sm font-semibold text-brand-800">{cat.name}</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-ink-700">
                  {cat.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Notes({ data, act, busy }) {
  const [text, setText] = useState("");
  const notes = data.case.hospitalNotes || [];
  return (
    <section className="card p-6">
      <p className="font-bold text-ink-900">Internal notes</p>
      <p className="text-sm text-ink-500">Visible to your hospital team only — never to the patient or other hospitals.</p>
      <ul className="mt-4 space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-sun-50 p-3 text-sm text-ink-800">
            {n.text}
            <span className="mt-1 block text-xs text-ink-400">
              {n.by} · {formatDateTime(n.at)}
            </span>
          </li>
        ))}
        {!notes.length && <li className="text-sm text-ink-400">No notes yet.</li>}
      </ul>
      <Textarea rows={3} className="mt-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Cardiology to review echo before quoting" aria-label="New note" />
      <Button className="mt-3" disabled={busy || !text.trim()} onClick={async () => (await act("note", { text }, "Note saved")) && setText("")}>
        Save note
      </Button>
    </section>
  );
}

function OpinionForm({ data, act, busy }) {
  const so = data.case.secondOpinion || {};
  const [summary, setSummary] = useState(so.summary || "");
  const [recs, setRecs] = useState(so.recommendations || "");
  if (so.status === "delivered")
    return (
      <section className="card p-6">
        <Badge tone="success">Delivered {formatDate(so.deliveredAt)}</Badge>
        <p className="mt-4 whitespace-pre-line text-ink-700">{so.summary}</p>
        {so.recommendations && <p className="mt-4 whitespace-pre-line rounded-2xl bg-brand-50 p-4 text-ink-700">{so.recommendations}</p>}
      </section>
    );
  return (
    <section className="card space-y-4 p-6">
      <div>
        <p className="font-bold text-ink-900">Written second opinion</p>
        <p className="text-sm text-ink-500">Answer the patient&rsquo;s questions in plain language. State what you would need to know more about.</p>
      </div>
      <Textarea rows={10} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Your assessment of the reports and answers to the patient's questions…" aria-label="Opinion" />
      <Textarea rows={4} value={recs} onChange={(e) => setRecs(e.target.value)} placeholder="Options you would consider (surgical and non-surgical), and further tests if needed" aria-label="Recommendations" />
      <Button disabled={busy || summary.trim().length < 40} onClick={() => act("secondOpinion", { summary, recommendations: recs }, "Opinion delivered to the patient")}>
        <FileCheck2 size={16} aria-hidden /> Deliver opinion
      </Button>
    </section>
  );
}

export default function HospitalCaseWorkspace({ hid, caseId, me, hospitalCountry, initialTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, busy, reload, act } = useCase(caseId);
  const [tab, setTabState] = useState(initialTab || "case");
  const setTab = (t) => {
    setTabState(t);
    router.replace(`${pathname}?tab=${t}`, { scroll: false });
  };

  if (error) return <div className="container-wc py-32"><EmptyState icon={FileText} title="Case unavailable">{error.message}</EmptyState></div>;
  if (!data)
    return (
      <div className="container-wc space-y-4 pb-16 pt-32">
        <div className="skeleton h-10 w-72 rounded-xl" />
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  const c = data.case;
  const second = c.type === "second_opinion";
  const mineAccepted = data.quotations.some((q) => q.status === "accepted");
  const assignedOpinion = second && c.secondOpinion?.hospitalId === hid;
  const treating = mineAccepted || assignedOpinion;
  const tabs = [
    { id: "case", label: "Case", icon: ClipboardList },
    { id: "documents", label: "Documents", icon: FileText, count: data.files.length },
    ...(second ? (assignedOpinion ? [{ id: "opinion", label: "Opinion", icon: FileCheck2 }] : []) : [{ id: "quote", label: "Quote", icon: ReceiptText }]),
    { id: "messages", label: "Messages", icon: MessageSquare },
    ...(!second && mineAccepted ? [{ id: "travel", label: "Travel & visa", icon: Plane }, { id: "recovery", label: "Recovery", icon: HeartPulse }] : []),
    { id: "notes", label: "Notes", icon: StickyNote },
  ];
  const v = c.visaLetter || {};

  return (
    <>
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-10 pt-28">
          <Link href={`/hospital/${hid}`} className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
            <ArrowLeft size={16} aria-hidden /> Pipeline
          </Link>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-glow">
                {second ? "Second-opinion request" : "Case"} · {c.id.replace(/^case_/, "").slice(-8).toUpperCase()}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{c.patientName}</h1>
              <p className="mt-1 text-ink-300">
                {treatmentBySlug(c.treatmentSlug)?.name || c.specialty || "Specialty to be confirmed"} · from {c.countryOfResidence || "—"} · received {formatDate(c.createdAt)}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-300">
              Status
              <Select value={c.myStatus} onChange={(e) => act("hospitalStatus", { status: e.target.value }, "Status updated")} disabled={busy} className="h-10 w-44 border-white/20 bg-white/10 py-0 text-sm text-white">
                {HOSPITAL_PIPELINE.map((p) => (
                  <option key={p.id} value={p.id} className="text-ink-900">
                    {p.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      </section>
      <div className="container-wc py-8">
        <Tabs tabs={tabs} value={tab} onChange={setTab} className="w-fit max-w-full" />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                {tab === "case" && <CaseInfo data={data} act={act} />}
                {tab === "documents" && <DocumentsPanel caseId={c.id} files={data.files} meId={me.id} onChange={reload} hint="Share results, discharge summaries or your treatment plan with the patient." />}
                {tab === "quote" && <QuoteBuilder data={data} onSubmitted={reload} hospitalCountry={hospitalCountry} />}
                {tab === "opinion" && <OpinionForm data={data} act={act} busy={busy} />}
                {tab === "messages" && <MessagesPanel caseId={c.id} meId={me.id} placeholder="Message the patient…" />}
                {tab === "travel" && <TravelTab data={data} act={act} busy={busy} editable />}
                {tab === "recovery" && <RecoveryTab data={data} act={act} busy={busy} role="hospital" />}
                {tab === "notes" && <Notes data={data} act={act} busy={busy} />}
              </motion.div>
            </AnimatePresence>
          </div>
          <aside className="space-y-5">
            {treating && !second && (
              <section className="card p-5">
                <p className="flex items-center gap-2 font-bold text-ink-900">
                  <Flag size={16} className="text-brand-600" aria-hidden /> Post a milestone
                </p>
                <p className="text-xs text-ink-500">Updates the patient and their family link.</p>
                <div className="mt-3 grid gap-2">
                  {HOSPITAL_UPDATES.map((u) => (
                    <Button key={u.id} size="sm" variant="outline" disabled={busy} onClick={() => act("milestone", { update: u.id }, `Posted: ${u.label}`)}>
                      {u.label}
                    </Button>
                  ))}
                  <Button size="sm" variant="dark" disabled={busy || c.stage === "Completed"} onClick={() => act("complete", {}, "Case marked complete")}>
                    Mark case complete
                  </Button>
                </div>
              </section>
            )}
            {mineAccepted && (
              <section className="card p-5">
                <p className="font-bold text-ink-900">Visa invitation letter</p>
                {v.status === "issued" ? (
                  <>
                    <p className="mt-1 text-sm text-ink-500">Issued {formatDate(v.issuedAt)} · {v.refNo}</p>
                    <Link href={`/case/${c.id}/visa-letter`} target="_blank" className={buttonClass({ size: "sm", variant: "outline", className: "mt-3" })}>
                      Open letter <ExternalLink size={13} aria-hidden />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-ink-500">{v.status === "requested" ? `Requested by the patient ${formatDate(v.requestedAt)}.` : "Not requested yet — you can issue it proactively."}</p>
                    <Button size="sm" className="mt-3" disabled={busy} onClick={() => act("issueVisaLetter", {}, "Visa letter issued")}>
                      Issue letter
                    </Button>
                  </>
                )}
              </section>
            )}
            <section className="card p-5">
              <p className="font-bold text-ink-900">Timeline</p>
              <ol className="mt-3 space-y-3">
                {c.timeline_events
                  .slice()
                  .reverse()
                  .slice(0, 12)
                  .map((e, i) => (
                    <li key={`${e.at}-${i}`} className="border-l-2 border-ink-100 pl-3">
                      <p className="text-sm text-ink-800">{e.label}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(e.at)}</p>
                    </li>
                  ))}
              </ol>
            </section>
            <p className={cn("rounded-2xl bg-ink-50 p-4 text-xs text-ink-500")}>Access to this case is logged. Patient data is shared with you only for coordinating this patient&rsquo;s care.</p>
          </aside>
        </div>
      </div>
    </>
  );
}
