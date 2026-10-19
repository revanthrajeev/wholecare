"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Building2, CalendarCheck, Inbox, Star, Users, ScrollText, Search, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ExternalLink, Bot, Clock, TrendingUp, Video, Eye, EyeOff, Mail, Phone, ArrowRight, UserCheck } from "lucide-react";
import { Badge, Button, EmptyState, Input, Select, Stars, Stat, SampleBadge, cn, formatDate, formatDateTime, timeAgo } from "@/components/ui/core";
import { Tabs, api, useToast } from "@/components/ui/client";
import HBarChart, { ORDINAL_TEAL } from "@/components/HBarChart";

const STAGE_TONE = { Submitted: "neutral", "Under Review": "sun", "Sent to Hospitals": "brand", "Quotation Received": "coral", Confirmed: "success", "In Treatment": "brand", Recovery: "brand", Completed: "success" };
const INQUIRY_STATUSES = ["new", "contacted", "converted", "closed"];
const CHECKS = [
  ["license", "Licence"],
  ["accreditation", "Accreditation"],
  ["intlDesk", "Intl. desk"],
  ["siteVisit", "Site visit"],
];
const PROVIDER_LABEL = { claude: "Claude", ollama: "Local model (Ollama)", rules: "Rules engine" };

function Panel({ title, sub, action, children, className }) {
  return (
    <section className={cn("card min-w-0 p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink-900">{title}</p>
          {sub && <p className="text-xs text-ink-400">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <div className="relative min-w-60 flex-1">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} className="py-2.5 pl-10 text-sm" />
    </div>
  );
}

// Runs one mutation, toasts the outcome, then refreshes the console data.
function useMutation(reload) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const run = useCallback(
    async (key, path, body, message) => {
      setBusy(key);
      try {
        await api(path, { method: "PATCH", body });
        toast(message);
        await reload();
      } catch (e) {
        toast(e.message, "error");
      } finally {
        setBusy(null);
      }
    },
    [reload, toast]
  );
  return [busy, run];
}

/* ---------- Overview ---------- */
function Overview({ data, go }) {
  const s = data.stats;
  const unassigned = data.cases.filter((c) => !c.coordinatorId && c.stage !== "Completed");
  const pendingHospitals = data.hospitals.filter((h) => !h.verified);
  const pendingConsults = data.consultations.filter((c) => c.status === "requested");
  const newInquiries = data.inquiries.filter((i) => i.status === "new");
  const queue = [
    { icon: UserCheck, label: "Cases without a coordinator", tab: "cases", items: unassigned.map((c) => `${c.patientName} · ${c.specialty || "General"}`) },
    { icon: ShieldAlert, label: "Hospitals awaiting verification", tab: "hospitals", items: pendingHospitals.map((h) => `${h.name}${h.verification?.requestedAt ? " · review requested" : ""}`) },
    { icon: CalendarCheck, label: "Consultations to confirm", tab: "consultations", items: pendingConsults.map((c) => `${c.patient || "Patient"} with ${c.doctorName} · ${formatDate(c.date, { day: "numeric", month: "short" })}`) },
    { icon: Inbox, label: "New inquiries", tab: "inquiries", items: newInquiries.map((i) => `${i.name} · ${i.message.slice(0, 48)}${i.message.length > 48 ? "…" : ""}`) },
  ];
  const providers = Object.entries(s.assistantByProvider || {}).map(([p, n]) => ({ label: PROVIDER_LABEL[p] || p, value: n }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open cases" value={s.openCases} hint={`${s.unassigned} without a coordinator`} icon={FolderKanban} />
        <Stat label="Verified hospitals" value={s.hospitals} hint={`${s.pendingHospitals} awaiting verification`} icon={ShieldCheck} />
        <Stat label="Quote acceptance" value={s.acceptanceRate != null ? `${s.acceptanceRate}%` : "—"} hint={`${s.quotes} quotes issued so far`} icon={TrendingUp} tone="sun" />
        <Stat label="Avg. time to first quote" value={s.avgFirstQuoteHours != null ? `${s.avgFirstQuoteHours}h` : "—"} hint="From sending a case to its first quote" icon={Clock} tone="coral" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Case funnel" sub="Every case, grouped by where it is today">
          <HBarChart data={data.funnel.map((f) => ({ label: f.label, value: f.count }))} colors={ORDINAL_TEAL} valueLabel="Cases" />
        </Panel>
        <Panel title="Patients by country" sub="Country of residence on each case">
          <HBarChart data={data.byCountry.map((x) => ({ label: x.country, value: x.count }))} valueLabel="Cases" />
        </Panel>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Needs attention" sub="Work waiting on the operations team">
          <ul className="divide-y divide-line">
            {queue.map(({ icon: Icon, label, tab, items }) => (
              <li key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={cn("mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", items.length ? "bg-sun-50 text-sun-700" : "bg-ok-50 text-ok-700")}>
                  <Icon size={17} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">
                    {label} <span className="ml-1 tabular-nums text-ink-400">{items.length}</span>
                  </p>
                  {items.length ? (
                    <ul className="mt-1 space-y-0.5">
                      {items.slice(0, 3).map((x) => (
                        <li key={x} className="truncate text-xs text-ink-500">
                          {x}
                        </li>
                      ))}
                      {items.length > 3 && <li className="text-xs text-ink-400">+{items.length - 3} more</li>}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-xs text-ok-700">All clear</p>
                  )}
                </div>
                {items.length > 0 && (
                  <button onClick={() => go(tab)} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                    Open <ArrowRight size={14} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="AI assistant" sub={`${s.assistantChats} conversation${s.assistantChats === 1 ? "" : "s"} logged`}>
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
            <Bot size={16} className="text-brand-600" aria-hidden />
            Answering with: <span className="font-semibold text-ink-900">{PROVIDER_LABEL[s.aiProvider] || s.aiProvider}</span>
          </p>
          <HBarChart data={providers} valueLabel="Conversations" emptyText="No assistant conversations yet" />
          {s.aiProvider === "rules" && <p className="mt-3 text-xs text-ink-400">Set ANTHROPIC_API_KEY on the server to answer with Claude. The rules engine stays as the fallback.</p>}
        </Panel>
      </div>
    </div>
  );
}

/* ---------- Cases ---------- */
function Cases({ data, me, reload }) {
  const [busy, run] = useMutation(reload);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [owner, setOwner] = useState("all");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.cases.filter(
      (c) =>
        (stage === "all" || c.stage === stage) &&
        (owner === "all" || (owner === "me" ? c.coordinatorId === me.id : !c.coordinatorId)) &&
        (!needle || `${c.patientName} ${c.specialty} ${c.countryOfResidence} ${c.id}`.toLowerCase().includes(needle))
    );
  }, [data.cases, q, stage, owner, me.id]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search patient, specialty, country or case ID" label="Search cases" />
        <Select value={stage} onChange={(e) => setStage(e.target.value)} className="w-auto py-2.5 text-sm" aria-label="Filter by stage">
          <option value="all">All stages</option>
          {data.stages.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select value={owner} onChange={(e) => setOwner(e.target.value)} className="w-auto py-2.5 text-sm" aria-label="Filter by coordinator">
          <option value="all">Any coordinator</option>
          <option value="me">Assigned to me</option>
          <option value="none">Unassigned</option>
        </Select>
      </div>
      <p className="mb-3 text-xs text-ink-400">
        Showing {list.length} of {data.cases.length} cases
      </p>
      {list.length ? (
        <div className="card divide-y divide-line">
          {list.map((c) => (
            <div key={c.id} className={cn("grid grid-cols-1 gap-3 p-4 transition lg:grid-cols-[1.4fr_1fr_190px_210px] lg:items-center lg:gap-4", busy === c.id && "opacity-60")}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/case/${c.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {c.patientName}
                  </Link>
                  {c.type === "second_opinion" && <Badge tone="sun">2nd opinion</Badge>}
                  <Badge tone={STAGE_TONE[c.stage] || "neutral"}>{c.stage}</Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-ink-500">
                  {c.specialty || "General"} · {c.countryOfResidence} · <span className="font-mono text-xs">{c.id}</span>
                </p>
              </div>
              <div className="min-w-0 text-sm text-ink-500">
                <p className="truncate">{c.hospitals.length ? c.hospitals.join(", ") : "Not sent to hospitals yet"}</p>
                <p className="text-xs text-ink-400" suppressHydrationWarning>
                  {c.quotes} quote{c.quotes === 1 ? "" : "s"} · updated {timeAgo(c.updatedAt)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:contents">
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400 lg:sr-only">Coordinator</span>
                  <Select
                    value={c.coordinatorId || ""}
                    disabled={busy === c.id}
                    onChange={(e) => e.target.value && run(c.id, `/api/cases/${c.id}`, { action: "assignCoordinator", coordinatorId: e.target.value }, "Coordinator assigned — patient notified")}
                    className="py-2 text-sm"
                  >
                    <option value="" disabled={!!c.coordinatorId}>
                      Unassigned
                    </option>
                    {data.staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                        {s.id === me.id ? " (you)" : ""}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-400 lg:sr-only">Stage</span>
                  <Select value={c.stage} disabled={busy === c.id} onChange={(e) => run(c.id, `/api/cases/${c.id}`, { action: "stage", stage: e.target.value }, `Moved to ${e.target.value}`)} className="py-2 text-sm">
                    {data.stages.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={FolderKanban} title="No cases match">
          Try clearing the search or filters.
        </EmptyState>
      )}
    </div>
  );
}

/* ---------- Hospitals ---------- */
function Hospitals({ data, me, reload }) {
  const [busy, run] = useMutation(reload);
  const [filter, setFilter] = useState("all");
  const isAdmin = me.role === "admin";
  const list = data.hospitals
    .filter((h) => filter === "all" || (filter === "pending" ? !h.verified : h.verified))
    .sort((a, b) => Number(a.verified) - Number(b.verified) || a.name.localeCompare(b.name));
  const patch = (h, body, message) => run(h.id, `/api/admin/hospitals/${h.id}`, body, message);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          size="sm"
          tabs={[
            { id: "all", label: `All (${data.hospitals.length})` },
            { id: "pending", label: "Awaiting verification", count: data.hospitals.filter((h) => !h.verified).length },
            { id: "live", label: "Live" },
          ]}
          value={filter}
          onChange={setFilter}
          className="w-fit max-w-full"
        />
        {!isAdmin && <p className="text-xs text-ink-500">Only admins can change verification. You can see status and requests.</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((h) => {
          const v = h.verification || {};
          const ready = v.license && v.accreditation && v.intlDesk;
          return (
            <article key={h.id} className={cn("card flex flex-col p-5 transition", busy === h.id && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{h.name}</p>
                  <p className="text-sm text-ink-500">
                    {h.city}, {h.country} · {h.cases} case{h.cases === 1 ? "" : "s"}
                    {h.rating ? ` · ${h.rating.toFixed(1)}★ from ${h.reviewCount}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {h.sample && <SampleBadge />}
                  <Badge tone={h.verified ? "success" : "sun"} icon={h.verified ? ShieldCheck : ShieldAlert}>
                    {h.verified ? "Live" : "Pending"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CHECKS.map(([k, label]) => (
                  <label key={k} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition", v[k] ? "border-[#bfe5cb] bg-ok-50 text-ok-700" : "border-line text-ink-600", isAdmin && "cursor-pointer hover:border-ink-300")}>
                    <input
                      type="checkbox"
                      checked={!!v[k]}
                      disabled={!isAdmin || busy === h.id}
                      onChange={(e) => patch(h, { verification: { [k]: e.target.checked } }, `${label} ${e.target.checked ? "confirmed" : "unchecked"}`)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {v.notes && (
                <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
                  <span className="font-semibold text-ink-800">Notes:</span> {v.notes}
                  {v.requestedAt && (
                    <span className="text-ink-400" suppressHydrationWarning>
                      {" "}
                      · requested {timeAgo(v.requestedAt)}
                    </span>
                  )}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                <p className="text-xs text-ink-400">{h.lastVerified ? `Last verified ${formatDate(h.lastVerified)}` : "Never verified"}</p>
                <div className="flex gap-2">
                  {h.verified && (
                    <Button size="xs" variant="ghost" href={`/hospitals/${h.slug}`}>
                      Profile <ExternalLink size={13} aria-hidden />
                    </Button>
                  )}
                  {isAdmin &&
                    (h.verified ? (
                      <Button size="xs" variant="outline" disabled={busy === h.id} onClick={() => patch(h, { verified: false }, "Unpublished — hospital notified")}>
                        <EyeOff size={13} aria-hidden /> Unpublish
                      </Button>
                    ) : (
                      <Button size="xs" disabled={!ready || busy === h.id} title={ready ? undefined : "Confirm licence, accreditation and international desk first"} onClick={() => patch(h, { verified: true }, "Published — hospital notified")}>
                        <Eye size={13} aria-hidden /> Publish
                      </Button>
                    ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Consultations ---------- */
function Consultations({ data, reload }) {
  const [busy, run] = useMutation(reload);
  const [filter, setFilter] = useState("open");
  const today = new Date().toISOString().slice(0, 10);
  const open = (c) => c.status === "requested" || (c.status === "confirmed" && c.date >= today);
  const list = data.consultations.filter((c) => (filter === "open" ? open(c) : !open(c)));
  const act = (c, action, message) => run(c.id, `/api/consultations/${c.id}`, { action }, message);
  return (
    <div>
      <Tabs
        size="sm"
        tabs={[
          { id: "open", label: "Requested & upcoming", count: data.consultations.filter((c) => c.status === "requested").length },
          { id: "past", label: "Past & closed" },
        ]}
        value={filter}
        onChange={setFilter}
        className="mb-4 w-fit max-w-full"
      />
      {list.length ? (
        <div className="card divide-y divide-line">
          {list.map((c) => (
            <div key={c.id} className={cn("flex flex-wrap items-center gap-4 p-4", busy === c.id && "opacity-60")}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">
                  {c.patient || "Patient"} <span className="font-normal text-ink-400">with</span> {c.doctorName}
                </p>
                <p className="text-sm text-ink-500">
                  {c.hospitalName} · {formatDate(c.date, { weekday: "short", day: "numeric", month: "short" })} · {c.timeSlot} {c.timezone}
                </p>
                {c.reason && <p className="mt-1 line-clamp-1 text-xs text-ink-400">“{c.reason}”</p>}
              </div>
              <Badge tone={c.status === "confirmed" ? "success" : c.status === "requested" ? "sun" : c.status === "completed" ? "brand" : "neutral"}>{c.status}</Badge>
              <div className="flex gap-2">
                {c.status === "requested" && (
                  <>
                    <Button size="xs" disabled={busy === c.id} onClick={() => act(c, "confirm", "Confirmed — patient notified")}>
                      <CheckCircle2 size={14} aria-hidden /> Confirm
                    </Button>
                    <Button size="xs" variant="outline" disabled={busy === c.id} onClick={() => act(c, "decline", "Declined — patient notified")}>
                      <XCircle size={14} aria-hidden /> Decline
                    </Button>
                  </>
                )}
                {c.status === "confirmed" && (
                  <>
                    <Button size="xs" variant="soft" href={`/consultations/${c.id}`}>
                      <Video size={14} aria-hidden /> Room
                    </Button>
                    {c.date <= today && (
                      <Button size="xs" variant="outline" disabled={busy === c.id} onClick={() => act(c, "complete", "Marked complete")}>
                        Mark complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarCheck} title={filter === "open" ? "Nothing waiting" : "No past consultations"}>
          {filter === "open" ? "New consultation requests appear here for confirmation." : "Completed, declined and cancelled consultations appear here."}
        </EmptyState>
      )}
    </div>
  );
}

/* ---------- Inquiries ---------- */
function Inquiries({ data, reload }) {
  const [busy, run] = useMutation(reload);
  const [filter, setFilter] = useState("new");
  const list = data.inquiries.filter((i) => filter === "all" || i.status === filter);
  return (
    <div>
      <Tabs size="sm" tabs={[{ id: "all", label: "All" }, ...INQUIRY_STATUSES.map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1), count: s === "new" ? data.inquiries.filter((i) => i.status === "new").length : undefined }))]} value={filter} onChange={setFilter} className="mb-4 w-fit max-w-full" />
      {list.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((i) => (
            <article key={i.id} className={cn("card flex flex-col p-5", busy === i.id && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{i.name}</p>
                  <p className="flex flex-wrap gap-x-3 text-sm text-ink-500">
                    <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                      <Mail size={13} aria-hidden /> {i.email}
                    </a>
                    {i.phone && (
                      <a href={`tel:${i.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                        <Phone size={13} aria-hidden /> {i.phone}
                      </a>
                    )}
                  </p>
                </div>
                <Select value={i.status} disabled={busy === i.id} onChange={(e) => run(i.id, `/api/admin/inquiries/${i.id}`, { status: e.target.value }, `Marked ${e.target.value}`)} className="w-auto py-1.5 text-sm" aria-label={`Status for inquiry from ${i.name}`}>
                  {INQUIRY_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line text-sm text-ink-700">{i.message}</p>
              <p className="mt-3 text-xs text-ink-400" suppressHydrationWarning>
                {i.source ? `From ${i.source} · ` : ""}
                {formatDateTime(i.createdAt)}
                {i.handledBy ? ` · handled by ${i.handledBy}` : ""}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Inbox} title="No inquiries here">
          Messages from the contact form and assistant hand-offs land in this inbox.
        </EmptyState>
      )}
    </div>
  );
}

/* ---------- Reviews ---------- */
function Reviews({ data, reload }) {
  const [busy, run] = useMutation(reload);
  const [filter, setFilter] = useState("all");
  const list = data.reviews.filter((r) => filter === "all" || r.status === filter);
  return (
    <div>
      <Tabs
        size="sm"
        tabs={[
          { id: "all", label: `All (${data.reviews.length})` },
          { id: "published", label: "Published" },
          { id: "hidden", label: "Hidden" },
        ]}
        value={filter}
        onChange={setFilter}
        className="mb-4 w-fit max-w-full"
      />
      {list.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((r) => (
            <article key={r.id} className={cn("card flex flex-col p-5", r.status === "hidden" && "bg-ink-50", busy === r.id && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{r.hospital}</p>
                  <p className="text-sm text-ink-500">
                    {r.author}
                    {r.country ? `, ${r.country}` : ""} · {r.procedure}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">{r.verified ? <Badge tone="success">Verified patient</Badge> : r.sample ? <SampleBadge /> : null}</div>
              </div>
              <Stars rating={r.rating} className="mt-3" />
              <p className="mt-2 flex-1 text-sm text-ink-700">{r.text}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs text-ink-400">
                  {formatDate(r.date)} · <span className={r.status === "hidden" ? "font-semibold text-rose-600" : "text-ok-700"}>{r.status}</span>
                </p>
                {r.status === "published" ? (
                  <Button size="xs" variant="outline" disabled={busy === r.id} onClick={() => run(r.id, `/api/admin/reviews/${r.id}`, { status: "hidden" }, "Review hidden")}>
                    <EyeOff size={13} aria-hidden /> Hide
                  </Button>
                ) : (
                  <Button size="xs" variant="soft" disabled={busy === r.id} onClick={() => run(r.id, `/api/admin/reviews/${r.id}`, { status: "published" }, "Review published")}>
                    <Eye size={13} aria-hidden /> Publish
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Star} title="No reviews here" />
      )}
    </div>
  );
}

/* ---------- People ---------- */
const ROLE_TONE = { admin: "ink", coordinator: "brand", hospital: "sun", patient: "neutral" };
function People({ data }) {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const needle = q.trim().toLowerCase();
  const list = data.users.filter((u) => (role === "all" || u.role === role) && (!needle || `${u.name} ${u.email} ${u.hospital || ""}`.toLowerCase().includes(needle)));
  const counts = data.users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }), {});
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email or hospital" label="Search people" />
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-auto py-2.5 text-sm" aria-label="Filter by role">
          <option value="all">All roles ({data.users.length})</option>
          {["patient", "hospital", "coordinator", "admin"].map((r) => (
            <option key={r} value={r}>
              {r} ({counts[r] || 0})
            </option>
          ))}
        </Select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{u.name}</p>
                  {u.hospital && <p className="text-xs text-ink-400">{u.hospital}</p>}
                </td>
                <td className="px-4 py-3 text-ink-600">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[u.role] || "neutral"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-500">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="p-6 text-center text-sm text-ink-400">No one matches.</p>}
      </div>
    </div>
  );
}

/* ---------- Audit log ---------- */
function Audit({ data }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const list = data.auditLog.filter((a) => !needle || `${a.user} ${a.action} ${a.targetId}`.toLowerCase().includes(needle));
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBox value={q} onChange={setQ} placeholder="Filter by person, action or record ID" label="Filter audit log" />
        <p className="text-xs text-ink-400">Latest 150 events · who opened or changed what</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Who</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Record</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="whitespace-nowrap px-4 py-2.5 text-ink-500" suppressHydrationWarning>
                  {formatDateTime(a.at)}
                </td>
                <td className="px-4 py-2.5 text-ink-700">{a.user}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded-md bg-ink-50 px-1.5 py-0.5 font-mono text-xs text-ink-700">{a.action}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-500">
                  {/^case_/.test(a.targetId || "") ? (
                    <Link href={`/case/${a.targetId}`} className="text-brand-700 hover:underline">
                      {a.targetId}
                    </Link>
                  ) : (
                    a.targetId
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="p-6 text-center text-sm text-ink-400">No events match.</p>}
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */
const TAB_IDS = ["overview", "cases", "hospitals", "consultations", "inquiries", "reviews", "people", "audit"];

export default function AdminConsole({ me, initialTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(TAB_IDS.includes(initialTab) ? initialTab : "overview");

  const reload = useCallback(() => api("/api/admin/overview").then(setData).catch((e) => toast(e.message, "error")), [toast]);
  useEffect(() => {
    reload();
  }, [reload]);

  const go = (t) => {
    setTab(t);
    router.replace(`${pathname}?tab=${t}`, { scroll: false });
  };

  if (!data)
    return (
      <div className="container-wc space-y-4 pb-16 pt-32">
        <div className="skeleton h-10 w-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="skeleton h-28 rounded-3xl" />
          ))}
        </div>
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  const s = data.stats;
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "cases", label: "Cases", icon: FolderKanban, count: s.unassigned },
    { id: "hospitals", label: "Hospitals", icon: Building2, count: s.pendingHospitals },
    { id: "consultations", label: "Consults", icon: CalendarCheck, count: s.pendingConsultations },
    { id: "inquiries", label: "Inquiries", icon: Inbox, count: s.newInquiries },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "people", label: "People", icon: Users },
    { id: "audit", label: "Audit log", icon: ScrollText },
  ];

  return (
    <>
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-10 pt-28">
          <p className="eyebrow text-glow">Operations console</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Today&rsquo;s operations</h1>
              <p className="mt-1 text-ink-300">
                Signed in as {me.name} ({me.role}). {s.unassigned ? `${s.unassigned} case${s.unassigned === 1 ? "" : "s"} still need${s.unassigned === 1 ? "s" : ""} a coordinator.` : "Every open case has a coordinator."}
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Patients", s.patients],
              ["Cases", s.cases],
              ["Consultations", s.consultations],
              ["Quotes issued", s.quotes],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs text-ink-300">{l}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="container-wc py-8">
        <Tabs tabs={tabs} value={tab} onChange={go} className="w-fit max-w-full" />
        <div className="mt-6">
          {tab === "overview" && <Overview data={data} go={go} />}
          {tab === "cases" && <Cases data={data} me={me} reload={reload} />}
          {tab === "hospitals" && <Hospitals data={data} me={me} reload={reload} />}
          {tab === "consultations" && <Consultations data={data} reload={reload} />}
          {tab === "inquiries" && <Inquiries data={data} reload={reload} />}
          {tab === "reviews" && <Reviews data={data} reload={reload} />}
          {tab === "people" && <People data={data} />}
          {tab === "audit" && <Audit data={data} />}
        </div>
      </div>
    </>
  );
}
