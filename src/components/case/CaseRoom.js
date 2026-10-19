"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FileText, ReceiptText, MessageSquare, Video, Plane, HeartPulse, Users, FileCheck2, ArrowLeft, Headset, PartyPopper, X, Clock } from "lucide-react";
import { Badge, EmptyState, ProgressRail, cn, formatDateTime } from "@/components/ui/core";
import { Tabs } from "@/components/ui/client";
import { useCase } from "@/components/case/useCase";
import OverviewTab from "@/components/case/OverviewTab";
import DocumentsPanel from "@/components/case/DocumentsPanel";
import QuotesTab from "@/components/case/QuotesTab";
import MessagesPanel from "@/components/case/MessagesPanel";
import ConsultsTab from "@/components/case/ConsultsTab";
import TravelTab from "@/components/case/TravelTab";
import RecoveryTab from "@/components/case/RecoveryTab";
import FamilyTab from "@/components/case/FamilyTab";
import OpinionTab from "@/components/case/OpinionTab";
import StaffPanel from "@/components/case/StaffPanel";
import { STAGE_INFO } from "@/lib/constants";

const KIND_DOT = { patient: "bg-ink-400", hospital: "bg-brand-500", coordinator: "bg-sun-500", system: "bg-ink-300" };

export default function CaseRoom({ caseId, me, initialTab, welcome }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, busy, reload, act } = useCase(caseId);
  const [chosenTab, setTabState] = useState(initialTab || "overview");
  const [showWelcome, setShowWelcome] = useState(Boolean(welcome));

  const setTab = (t) => {
    setTabState(t);
    router.replace(`${pathname}?tab=${t}`, { scroll: false });
  };

  const tabs = useMemo(() => {
    if (!data) return [];
    const c = data.case;
    const openQuotes = data.quotations.filter((q) => q.status === "submitted").length;
    if (c.type === "second_opinion")
      return [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "opinion", label: "Opinion", icon: FileCheck2 },
        { id: "documents", label: "Documents", icon: FileText, count: data.files.length },
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "consults", label: "Consults", icon: Video },
      ];
    return [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "documents", label: "Documents", icon: FileText, count: data.files.length },
      { id: "quotes", label: "Quotes", icon: ReceiptText, count: openQuotes },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "consults", label: "Consults", icon: Video },
      { id: "travel", label: "Travel", icon: Plane },
      { id: "recovery", label: "Recovery", icon: HeartPulse },
      ...(data.viewer === "patient" ? [{ id: "family", label: "Family", icon: Users }] : []),
    ];
  }, [data]);

  const tab = !tabs.length || tabs.some((t) => t.id === chosenTab) ? chosenTab : "overview";

  if (error) {
    return (
      <div className="container-wc py-32">
        <EmptyState icon={FileText} title="We couldn't open this case" action={<Link href="/dashboard" className="font-semibold text-brand-700">Back to dashboard</Link>}>
          {error.message}
        </EmptyState>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container-wc space-y-4 pb-16 pt-32">
        <div className="skeleton h-10 w-72 rounded-xl" />
        <div className="skeleton h-4 w-full max-w-2xl rounded-full" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div className="skeleton h-96 rounded-3xl" />
          <div className="skeleton h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  const c = data.case;
  const second = c.type === "second_opinion";
  const steps = second ? ["Submitted", "Under Review", "Completed"] : data.stages;
  const stageForRail = second ? (c.stage === "Completed" ? "Completed" : "Under Review") : c.stage;
  const canAct = data.viewer === "patient" || data.viewer === "staff";

  return (
    <>
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-10 pt-28">
          <Link href={data.viewer === "staff" ? "/admin?tab=cases" : "/dashboard"} className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
            <ArrowLeft size={16} aria-hidden /> {data.viewer === "staff" ? "Operations console" : "My dashboard"}
          </Link>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-glow">
                {second ? "Second opinion" : "Case"} · {c.id.replace(/^case_/, "").slice(-8).toUpperCase()}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {c.patientName}
                {c.relationship && c.relationship !== "self" && data.viewer === "patient" ? <span className="ml-2 text-lg font-medium text-ink-300">(family)</span> : null}
              </h1>
              <p className="mt-1 text-ink-300">{c.specialty || "Specialty to be confirmed"}{c.preferredDestination ? ` · ${c.preferredDestination}` : ""}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="dark">{c.stage}</Badge>
              {data.coordinator ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm">
                  <Headset size={15} className="text-glow" aria-hidden /> {data.coordinator.name}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-sm text-ink-300">
                  <Clock size={15} aria-hidden /> Coordinator being assigned
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] px-5 pb-10 pt-5 [&_span]:!text-ink-200">
            <ProgressRail steps={steps} current={stageForRail} />
          </div>
        </div>
      </section>

      <div className="container-wc py-8">
        <AnimatePresence>
          {showWelcome && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-6 flex items-start gap-4 rounded-3xl border border-brand-200 bg-brand-50 p-5">
              <PartyPopper size={22} className="mt-0.5 shrink-0 text-brand-700" aria-hidden />
              <div className="flex-1 text-sm text-brand-900">
                <p className="font-semibold">{second ? "Your second-opinion request is in." : "Your case room is ready."}</p>
                <p className="mt-0.5">{STAGE_INFO[c.stage]?.next} Everything — reports, quotes, messages and travel — lives here. We&rsquo;ll notify you at each step.</p>
              </div>
              <button onClick={() => setShowWelcome(false)} aria-label="Dismiss" className="rounded-lg p-1 text-brand-700 hover:bg-brand-100">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs tabs={tabs} value={tab} onChange={setTab} className="w-fit max-w-full" />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
                {tab === "overview" && <OverviewTab data={data} act={act} busy={busy} reload={reload} setTab={setTab} />}
                {tab === "documents" && <DocumentsPanel caseId={c.id} files={data.files} meId={me.id} onChange={reload} />}
                {tab === "quotes" && <QuotesTab data={data} onChange={reload} canDecide={canAct} />}
                {tab === "messages" && (
                  <MessagesPanel caseId={c.id} meId={me.id} disabledReason={data.viewer === "patient" && !c.sentToHospitals.length && !c.coordinatorId ? "Messaging opens once your case is sent to a hospital or a coordinator is assigned." : null} />
                )}
                {tab === "consults" && <ConsultsTab data={data} onChange={reload} />}
                {tab === "travel" && <TravelTab data={data} act={act} busy={busy} editable={canAct} />}
                {tab === "recovery" && <RecoveryTab data={data} act={act} busy={busy} role={data.viewer === "patient" ? "patient" : "staff"} />}
                {tab === "family" && <FamilyTab data={data} act={act} busy={busy} />}
                {tab === "opinion" && <OpinionTab data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="space-y-5">
            {data.viewer === "staff" && <StaffPanel data={data} act={act} busy={busy} />}
            <section className="card p-5">
              <p className="font-bold text-ink-900">Timeline</p>
              <ol className="mt-4 space-y-4">
                {c.timeline_events
                  .slice()
                  .reverse()
                  .slice(0, 14)
                  .map((e, i) => (
                    <li key={`${e.at}-${i}`} className="relative pl-5">
                      <span aria-hidden className={cn("absolute left-0 top-1.5 h-2 w-2 rounded-full", KIND_DOT[e.kind] || KIND_DOT.system)} />
                      <p className="text-sm text-ink-800">{e.label}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(e.at)}</p>
                    </li>
                  ))}
              </ol>
            </section>
            {data.coordinator && (
              <section className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Your coordinator</p>
                <p className="mt-2 font-semibold text-ink-900">{data.coordinator.name}</p>
                <p className="text-sm text-ink-500">{data.coordinator.email}</p>
                <button onClick={() => setTab("messages")} className="mt-3 text-sm font-semibold text-brand-700 hover:underline">
                  Send a message
                </button>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
