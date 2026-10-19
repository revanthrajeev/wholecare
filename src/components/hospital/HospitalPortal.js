"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KanbanSquare, CalendarCheck, BarChart3, Clock, ReceiptText, Inbox, TrendingUp, ShieldAlert, Settings, Video, CheckCircle2, XCircle, GripVertical, FileText } from "lucide-react";
import { Badge, Button, EmptyState, Stat, cn, formatDate, timeAgo } from "@/components/ui/core";
import { Tabs, api, useToast } from "@/components/ui/client";
import HBarChart, { ORDINAL_TEAL_6 } from "@/components/HBarChart";
import { treatmentBySlug } from "@/content/treatments";

const COLUMN_TONE = { new: "bg-sun-400", reviewing: "bg-sun-500", quoted: "bg-brand-400", accepted: "bg-brand-600", in_treatment: "bg-brand-700", discharged: "bg-ok-600", lost: "bg-ink-300" };

function CaseCard({ c, hid, onDragStart }) {
  const t = treatmentBySlug(c.treatmentSlug);
  return (
    <Link
      href={`/hospital/${hid}/case/${c.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, c.id)}
      className="group block rounded-2xl border border-line bg-white p-3.5 shadow-soft transition hover:border-ink-300 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink-900">{c.patientName}</p>
        <GripVertical size={14} className="mt-0.5 shrink-0 text-ink-300 opacity-0 transition group-hover:opacity-100" aria-hidden />
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{t?.name || c.specialty || c.condition}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {c.type === "second_opinion" && <Badge tone="sun">2nd opinion</Badge>}
        <span className="text-[11px] text-ink-400">{c.countryOfResidence}</span>
        <span className="text-[11px] text-ink-300">·</span>
        <span className="text-[11px] text-ink-400" suppressHydrationWarning>{timeAgo(c.updatedAt || c.createdAt)}</span>
      </div>
    </Link>
  );
}

function Pipeline({ data, hid, onMove }) {
  const [over, setOver] = useState(null);
  const dragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };
  if (!data.cases.length)
    return (
      <EmptyState icon={Inbox} title="No cases yet">
        {data.hospital.verified ? "Cases patients send you appear here." : "Cases arrive once your hospital is verified and listed."}
      </EmptyState>
    );
  return (
    <div className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
      {data.pipeline.map((col) => {
        const items = data.cases.filter((c) => c.myStatus === col.id);
        return (
          <section
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(null);
              const id = e.dataTransfer.getData("text/plain");
              const c = data.cases.find((x) => x.id === id);
              if (c && c.myStatus !== col.id) onMove(id, col.id);
            }}
            className={cn("flex w-64 shrink-0 flex-col rounded-3xl p-3 transition", over === col.id ? "bg-brand-50 ring-2 ring-brand-300" : "bg-ink-100/60")}
            aria-label={`${col.label} column`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <span className={cn("h-2 w-2 rounded-full", COLUMN_TONE[col.id])} aria-hidden /> {col.label}
              </span>
              <span className="rounded-full bg-white px-2 text-xs font-semibold text-ink-500">{items.length}</span>
            </header>
            <div className="flex min-h-24 flex-col gap-2">
              {items.map((c) => (
                <CaseCard key={c.id} c={c} hid={hid} onDragStart={dragStart} />
              ))}
              {!items.length && <p className="rounded-2xl border border-dashed border-ink-200 px-3 py-6 text-center text-xs text-ink-400">Drop cases here</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Consultations({ data, reload }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  async function act(id, action) {
    setBusy(id);
    try {
      await api(`/api/consultations/${id}`, { method: "PATCH", body: { action } });
      toast(action === "confirm" ? "Confirmed — the patient has been notified." : "Declined.");
      reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(null);
    }
  }
  const groups = [
    ["Needs confirmation", data.consultations.filter((c) => c.status === "requested")],
    ["Upcoming", data.consultations.filter((c) => c.status === "confirmed" && c.date >= today)],
    ["Past & closed", data.consultations.filter((c) => !(c.status === "requested" || (c.status === "confirmed" && c.date >= today)))],
  ];
  if (!data.consultations.length) return <EmptyState icon={CalendarCheck} title="No consultation requests yet">Patients book from your doctors&rsquo; profiles.</EmptyState>;
  return (
    <div className="space-y-8">
      {groups.map(([title, list]) =>
        list.length ? (
          <section key={title}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-400">{title}</h3>
            <div className="card divide-y divide-line">
              {list.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900">
                      {c.patient} <span className="font-normal text-ink-400">with</span> {c.doctorName}
                    </p>
                    <p className="text-sm text-ink-500">
                      {formatDate(c.date, { weekday: "short", day: "numeric", month: "short" })} · {c.timeSlot} {c.timezone}
                      {c.reason ? ` · “${c.reason.slice(0, 60)}${c.reason.length > 60 ? "…" : ""}”` : ""}
                    </p>
                  </div>
                  <Badge tone={c.status === "confirmed" ? "success" : c.status === "requested" ? "sun" : "neutral"}>{c.status}</Badge>
                  {c.status === "requested" ? (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={busy === c.id} onClick={() => act(c.id, "confirm")}>
                        <CheckCircle2 size={15} aria-hidden /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === c.id} onClick={() => act(c.id, "decline")}>
                        <XCircle size={15} aria-hidden /> Decline
                      </Button>
                    </div>
                  ) : (
                    <Link href={`/consultations/${c.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
                      {c.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1">
                          <Video size={15} aria-hidden /> Open room
                        </span>
                      ) : (
                        "Details"
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}

function Analytics({ data }) {
  const a = data.analytics;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Avg. first response" value={a.avgFirstResponseHours != null ? `${a.avgFirstResponseHours}h` : "—"} hint="From case received to first quote or message" icon={Clock} />
        <Stat label="Quote acceptance" value={a.acceptanceRate != null ? `${a.acceptanceRate}%` : "—"} hint="Of quotes patients decided on" icon={TrendingUp} />
        <Stat label="Accepted quote value" value={`$${a.acceptedValueUSD.toLocaleString("en-US")}`} hint="Locked quotes, all time" icon={ReceiptText} tone="sun" />
        <Stat label="Open quotes" value={a.openQuotes} hint="Awaiting patient decision" icon={FileText} tone="coral" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <p className="font-bold text-ink-900">Cases by patient country</p>
          <p className="text-xs text-ink-400">Where your international demand comes from</p>
          <div className="mt-4">
            <HBarChart data={a.byOrigin.map((x) => ({ label: x.country, value: x.count }))} valueLabel="Cases" />
          </div>
        </section>
        <section className="card p-6">
          <p className="font-bold text-ink-900">Pipeline</p>
          <p className="text-xs text-ink-400">Cases at each stage right now</p>
          <div className="mt-4">
            <HBarChart data={data.pipeline.filter((p) => p.id !== "lost").map((p) => ({ label: p.label, value: p.count }))} colors={ORDINAL_TEAL_6} valueLabel="Cases" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HospitalPortal({ hid, initialTab, welcome }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(initialTab || "pipeline");

  const reload = useCallback(() => api(`/api/hospital/overview?hid=${hid}`).then(setData).catch((e) => toast(e.message, "error")), [hid, toast]);
  useEffect(() => {
    reload();
  }, [reload]);

  async function move(caseId, status) {
    setData((d) => ({ ...d, cases: d.cases.map((c) => (c.id === caseId ? { ...c, myStatus: status } : c)) }));
    try {
      await api(`/api/cases/${caseId}`, { method: "PATCH", body: { action: "hospitalStatus", status } });
      reload();
    } catch (e) {
      toast(e.message, "error");
      reload();
    }
  }

  if (!data)
    return (
      <div className="container-wc space-y-4 pb-16 pt-32">
        <div className="skeleton h-10 w-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((k) => <div key={k} className="skeleton h-28 rounded-3xl" />)}</div>
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  const h = data.hospital;
  const newCount = data.cases.filter((c) => c.myStatus === "new").length;
  const tabs = [
    { id: "pipeline", label: "Pipeline", icon: KanbanSquare, count: newCount },
    { id: "consultations", label: "Consultations", icon: CalendarCheck, count: data.analytics.pendingConsults },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];
  const checks = h.verification || {};

  return (
    <>
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-10 pt-28">
          <p className="eyebrow text-glow">Hospital portal</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{h.name}</h1>
              <p className="mt-1 text-ink-300">
                {h.city}, {h.country} · {h.accreditations?.join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {h.verified && (
                <Link href={`/hospitals/${h.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
                  View public profile
                </Link>
              )}
              <Link href={`/hospital/${hid}/profile`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-brand-50">
                <Settings size={15} aria-hidden /> Edit profile
              </Link>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["New cases", newCount],
              ["Active cases", data.cases.filter((c) => !["lost", "discharged"].includes(c.myStatus)).length],
              ["Pending consults", data.analytics.pendingConsults],
              ["Avg. first response", data.analytics.avgFirstResponseHours != null ? `${data.analytics.avgFirstResponseHours}h` : "—"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs text-ink-300">{l}</p>
                <p className="mt-1 font-display text-2xl font-bold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="container-wc py-8">
        {!h.verified && (
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-sun-100 bg-sun-50 p-5 sm:flex-row sm:items-center">
            <ShieldAlert size={22} className="shrink-0 text-sun-700" aria-hidden />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-sun-700">{welcome ? "Welcome! Your hospital account is set up." : "Verification in progress"} Your public profile goes live once checks are complete.</p>
              <p className="mt-1 text-ink-600">
                Licence {checks.license ? "✓" : "pending"} · Accreditation {checks.accreditation ? "✓" : "pending"} · International desk {checks.intlDesk ? "✓" : "pending"} · Site visit {checks.siteVisit ? "✓" : "optional"}
                {checks.notes ? ` — ${checks.notes}` : ""}
              </p>
            </div>
            <Link href={`/hospital/${hid}/profile`} className="shrink-0 text-sm font-semibold text-sun-700 underline">
              Complete your profile
            </Link>
          </div>
        )}
        <Tabs
          tabs={tabs}
          value={tab}
          onChange={(t) => {
            setTab(t);
            router.replace(`${pathname}?tab=${t}`, { scroll: false });
          }}
          className="w-fit max-w-full"
        />
        <div className="mt-6">
          {tab === "pipeline" && (
            <>
              <p className="mb-4 text-sm text-ink-500">Drag cards between columns to update their status. Quoting and patient decisions move cards automatically.</p>
              <Pipeline data={data} hid={hid} onMove={move} />
            </>
          )}
          {tab === "consultations" && <Consultations data={data} reload={reload} />}
          {tab === "analytics" && <Analytics data={data} />}
        </div>
      </div>
    </>
  );
}

