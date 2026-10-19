"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, Building2, CheckCircle2, ArrowRight, RefreshCw, ClipboardList, MessageCircleQuestion } from "lucide-react";
import { Badge, Button, HospitalCover, RatingPill, cn, formatDateTime } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";
import { STAGE_INFO, HOSPITAL_PIPELINE } from "@/lib/constants";
import { treatmentBySlug } from "@/content/treatments";

const PIPE = Object.fromEntries(HOSPITAL_PIPELINE.map((p) => [p.id, p.label]));
const PIPE_TONE = { new: "neutral", reviewing: "sun", quoted: "brand", accepted: "success", in_treatment: "success", discharged: "success", lost: "neutral" };

function SendHospitals({ data, act, busy }) {
  const [picked, setPicked] = useState([]);
  const rec = data.recommended || [];
  if (!rec.length) return null;
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold text-ink-900">
            <Building2 size={18} className="text-brand-600" aria-hidden /> {data.case.sentToHospitals.length ? "Add more hospitals" : "Choose hospitals to send your case to"}
          </p>
          <p className="mt-1 text-sm text-ink-500">Ranked for your case. Only the hospitals you tick will see your records.</p>
        </div>
        <Link href="/hospitals" className="text-sm font-semibold text-brand-700 hover:underline">
          Browse all
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {rec.map(({ hospital: h, reasons }) => {
          const on = picked.includes(h.id);
          return (
            <label key={h.id} className={cn("flex cursor-pointer gap-3 rounded-2xl border p-3 transition", on ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15" : "border-line bg-white hover:border-ink-300")}>
              <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== h.id) : [...p, h.id]))} className="sr-only" />
              <HospitalCover hospital={h} className="h-16 w-16 shrink-0 rounded-xl" sizes="64px" />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink-900">{h.name}</span>
                  <CheckCircle2 size={18} className={cn("shrink-0", on ? "text-brand-600" : "text-ink-200")} aria-hidden />
                </span>
                <span className="block text-xs text-ink-500">
                  {h.city}, {h.country}
                </span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {reasons.slice(0, 2).map((r) => (
                    <span key={r} className="rounded-full bg-ink-50 px-2 py-0.5 text-[11px] text-ink-600">
                      {r}
                    </span>
                  ))}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-400">Covered by the consent you gave when creating this case.</p>
        <Button disabled={!picked.length || busy} onClick={async () => (await act("send", { hospitalIds: picked }, `Case sent to ${picked.length} hospital${picked.length > 1 ? "s" : ""}`)) && setPicked([])}>
          <Send size={16} aria-hidden /> Send to {picked.length || ""} hospital{picked.length === 1 ? "" : "s"}
        </Button>
      </div>
    </section>
  );
}

function AiSummary({ data, onChange, viewer }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const s = data.case.aiSummary;
  async function generate() {
    setBusy(true);
    try {
      await api("/api/ai/case-summary", { method: "POST", body: { caseId: data.case.id } });
      onChange();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <Sparkles size={18} className="text-brand-600" aria-hidden /> {viewer === "patient" ? "Case checklist" : "Intake summary"}
        </p>
        <Button size="xs" variant="soft" disabled={busy} onClick={generate}>
          {s ? <RefreshCw size={13} aria-hidden /> : <Sparkles size={13} aria-hidden />} {busy ? "Working…" : s ? "Refresh" : "Generate"}
        </Button>
      </div>
      {!s ? (
        <p className="mt-3 text-sm text-ink-500">Organise this case into a summary, a list of missing documents to add, and questions worth asking a specialist.</p>
      ) : (
        <div className="mt-4 space-y-4 text-sm">
          <p className="leading-relaxed text-ink-700">{s.structuredSummary}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{s.suggestedSpecialty}</Badge>
            {viewer !== "patient" && <Badge tone={s.triagePriority?.startsWith("Urgent") ? "danger" : s.triagePriority === "Priority" ? "sun" : "neutral"}>Triage: {s.triagePriority}</Badge>}
          </div>
          {s.missingInformation?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                <ClipboardList size={15} aria-hidden /> Worth adding
              </p>
              <ul className="mt-2 space-y-1.5">
                {s.missingInformation.map((m) => (
                  <li key={m} className="flex gap-2 text-ink-600">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sun-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {s.suggestedQuestionsForDoctor?.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-ink-900">
                <MessageCircleQuestion size={15} aria-hidden /> Questions to ask
              </p>
              <ul className="mt-2 space-y-1.5">
                {s.suggestedQuestionsForDoctor.map((m) => (
                  <li key={m} className="flex gap-2 text-ink-600">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="border-t border-line pt-3 text-xs text-ink-400">
            Organises what was shared — not a diagnosis. {s.provider === "claude" ? "Generated with Claude" : s.provider === "ollama" ? "Generated by a local model" : "Generated automatically from your answers"} · {formatDateTime(s.generatedAt)}
          </p>
        </div>
      )}
    </section>
  );
}

export default function OverviewTab({ data, act, busy, reload, setTab }) {
  const { case: c, hospitals, viewer, quotations } = data;
  const info = STAGE_INFO[c.stage] || {};
  const t = treatmentBySlug(c.treatmentSlug);
  const openQuotes = quotations.filter((q) => q.status === "submitted").length;
  const canSend = (viewer === "patient" || viewer === "staff") && c.type === "treatment" && !c.acceptedQuoteId;
  const nextAction =
    c.stage === "Quotation Received" && openQuotes ? { label: `Compare ${openQuotes} quote${openQuotes > 1 ? "s" : ""}`, tab: "quotes" } : c.stage === "Confirmed" ? { label: "Plan your travel", tab: "travel" } : ["Recovery", "In Treatment"].includes(c.stage) ? { label: "Open recovery plan", tab: "recovery" } : c.type === "second_opinion" && c.secondOpinion?.status === "delivered" ? { label: "Read your opinion", tab: "opinion" } : null;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-3xl bg-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-glow">Next step</p>
          <p className="mt-1 font-display text-xl font-bold">{info.next}</p>
        </div>
        {nextAction && (
          <Button variant="accent" onClick={() => setTab(nextAction.tab)}>
            {nextAction.label} <ArrowRight size={16} aria-hidden />
          </Button>
        )}
      </section>

      {c.sentToHospitals.length > 0 && (
        <section className="card p-6">
          <p className="font-bold text-ink-900">{c.type === "second_opinion" ? "Reviewing hospital" : "Hospitals on your case"}</p>
          <ul className="mt-4 divide-y divide-line">
            {c.sentToHospitals.map((hid) => {
              const h = hospitals[hid];
              const st = c.hospitalStatus?.[hid]?.status || "new";
              return (
                <li key={hid} className="flex items-center gap-3 py-3">
                  {h && <HospitalCover hospital={h} className="h-11 w-11 shrink-0 rounded-xl" sizes="44px" />}
                  <div className="min-w-0 flex-1">
                    <Link href={`/hospitals/${h?.slug}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                      {h?.name}
                    </Link>
                    <span className="flex items-center gap-2 text-xs text-ink-500">
                      {h?.city}, {h?.country} · <RatingPill rating={h?.rating} count={h?.reviewCount} />
                    </span>
                  </div>
                  <Badge tone={PIPE_TONE[st]}>{st === "new" ? "Received" : PIPE[st]}</Badge>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {canSend && <SendHospitals data={data} act={act} busy={busy} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="card p-6">
          <p className="font-bold text-ink-900">Case details</p>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Patient", `${c.patientName}${c.patientAge ? `, ${c.patientAge}` : ""}`],
              ["From", c.countryOfResidence || "—"],
              [c.type === "second_opinion" ? "Specialty" : "Treatment", t?.name || c.specialty || "To be confirmed"],
              ["Destination", c.preferredDestination || "Not sure yet"],
              ["Condition", c.condition],
              ["Care so far", c.existingTreatment || "—"],
              ...(c.type === "treatment" ? [["Budget", c.budgetRange || "—"], ["Timing", c.timeline || "—"]] : []),
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3">
                <dt className="text-ink-500">{k}</dt>
                <dd className="whitespace-pre-line text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <AiSummary data={data} onChange={reload} viewer={viewer} />
      </div>
    </div>
  );
}
