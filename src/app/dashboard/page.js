import { redirect } from "next/navigation";
import Link from "next/link";
import { ReceiptText, Video, FileCheck2, Scale, ArrowRight, Bell, CalendarClock, HeartPulse, AlertCircle, Plus, FolderOpen } from "lucide-react";
import { Badge, Button, EmptyState, ProgressRail, formatDate, formatDateTime } from "@/components/ui/core";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CASE_STAGES, STAGE_INFO } from "@/lib/constants";
import { treatmentBySlug } from "@/content/treatments";

export const dynamic = "force-dynamic";
export const metadata = { title: "My dashboard", robots: { index: false } };

const QUICK = [
  { href: "/get-quote", icon: ReceiptText, t: "Get a free quote", d: "Itemized quotes from verified hospitals" },
  { href: "/second-opinion", icon: FileCheck2, t: "Second opinion", d: "A specialist reviews your reports" },
  { href: "/consult", icon: Video, t: "Video consult", d: "Talk to a surgeon first" },
  { href: "/countries/compare", icon: Scale, t: "Compare destinations", d: "Prices, flights and visas" },
];

export default async function Dashboard() {
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "hospital") redirect(`/hospital/${user.hospitalId}`);
  if (user.role !== "patient") redirect("/admin");

  const cases = db.cases.filter((c) => c.ownerId === user.id).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  const consults = (db.consultations || []).filter((c) => c.ownerId === user.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = consults.filter((c) => ["requested", "confirmed"].includes(c.status) && c.date >= today).sort((a, b) => `${a.date}${a.timeSlot}`.localeCompare(`${b.date}${b.timeSlot}`));
  const notifications = (db.notifications || []).filter((n) => n.userId === user.id).slice(-6).reverse();

  const attention = [];
  for (const c of cases) {
    const open = db.quotations.filter((q) => q.caseId === c.id && q.status === "submitted");
    if (open.length && !c.acceptedQuoteId) attention.push({ icon: ReceiptText, tone: "brand", text: `${open.length} quote${open.length > 1 ? "s" : ""} to review for ${c.patientName}`, href: `/case/${c.id}?tab=quotes`, cta: "Compare" });
    if (c.visaLetter?.status === "issued" && c.stage === "Confirmed") attention.push({ icon: FileCheck2, tone: "success", text: `Visa letter ready for ${c.patientName}`, href: `/case/${c.id}?tab=travel`, cta: "Open" });
    if (c.type === "second_opinion" && c.secondOpinion?.status === "delivered" && c.stage === "Completed") attention.push({ icon: FileCheck2, tone: "success", text: `Second opinion ready for ${c.patientName}`, href: `/case/${c.id}?tab=opinion`, cta: "Read" });
    const overdue = (c.recovery?.plan || []).filter((t) => !t.done && t.due && t.due < today);
    if (overdue.length) attention.push({ icon: AlertCircle, tone: "coral", text: `${overdue.length} overdue recovery task${overdue.length > 1 ? "s" : ""} for ${c.patientName}`, href: `/case/${c.id}?tab=recovery`, cta: "Review" });
    if (["Recovery"].includes(c.stage) && !(c.recovery?.checkins || []).some((x) => x.date === today)) attention.push({ icon: HeartPulse, tone: "brand", text: `Log today's recovery check-in for ${c.patientName}`, href: `/case/${c.id}?tab=recovery`, cta: "Check in" });
  }
  for (const x of upcoming.filter((c) => c.status === "confirmed").slice(0, 2)) attention.push({ icon: Video, tone: "success", text: `Consult with ${x.doctorName} · ${formatDate(x.date, { day: "numeric", month: "short" })} ${x.timeSlot}`, href: `/consultations/${x.id}`, cta: "Join room" });

  return (
    <>
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-12 pt-28">
          <p className="eyebrow text-glow">My dashboard</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-bold">Welcome back, {(user.name || "there").split(" ")[0]}</h1>
            <Button href="/get-quote" variant="accent">
              <Plus size={16} aria-hidden /> New request
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {QUICK.map((q) => (
              <Link key={q.href} href={q.href} className="group rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur transition hover:border-glow/40 hover:bg-white/10">
                <q.icon size={20} className="text-glow" aria-hidden />
                <p className="mt-3 font-semibold">{q.t}</p>
                <p className="text-xs text-ink-300">{q.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-wc grid grid-cols-1 gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          {attention.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-ink-900">Needs your attention</h2>
              <ul className="mt-3 space-y-2">
                {attention.map((a, i) => (
                  <li key={i}>
                    <Link href={a.href} className="card card-hover flex items-center gap-4 p-4">
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.tone === "coral" ? "bg-coral-50 text-coral-700" : a.tone === "success" ? "bg-ok-50 text-ok-700" : "bg-brand-50 text-brand-700"}`}>
                        <a.icon size={18} aria-hidden />
                      </span>
                      <span className="flex-1 text-sm font-medium text-ink-900">{a.text}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                        {a.cta} <ArrowRight size={14} aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold text-ink-900">My cases</h2>
            {cases.length === 0 ? (
              <div className="mt-3">
                <EmptyState icon={FolderOpen} title="No cases yet" action={<Button href="/get-quote">Start with a free quote</Button>}>
                  Tell us what you need and share your reports — verified hospitals reply with itemized quotes.
                </EmptyState>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {cases.map((c) => {
                  const t = treatmentBySlug(c.treatmentSlug);
                  const quotes = db.quotations.filter((q) => q.caseId === c.id && q.status !== "superseded").length;
                  return (
                    <Link key={c.id} href={`/case/${c.id}`} className="card card-hover block p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{c.type === "second_opinion" ? "Second opinion" : "Treatment"}</p>
                          <p className="mt-1 font-display text-lg font-bold text-ink-900">
                            {c.patientName} · {t?.name || c.specialty || "Case"}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{STAGE_INFO[c.stage]?.next}</p>
                        </div>
                        <Badge tone={c.stage === "Completed" ? "neutral" : "brand"}>{c.stage}</Badge>
                      </div>
                      {c.type === "treatment" && (
                        <div className="mt-5">
                          <ProgressRail steps={CASE_STAGES} current={c.stage} compact />
                        </div>
                      )}
                      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
                        <span>{c.sentToHospitals.length} hospital{c.sentToHospitals.length === 1 ? "" : "s"}</span>
                        {c.type === "treatment" && <span>{quotes} quote{quotes === 1 ? "" : "s"}</span>}
                        <span>Updated {formatDate(c.updatedAt || c.createdAt)}</span>
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card p-5">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <CalendarClock size={18} className="text-brand-600" aria-hidden /> Upcoming consultations
            </p>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">
                None booked. <Link href="/consult" className="font-semibold text-brand-700 hover:underline">Book a video consult</Link>
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {upcoming.map((x) => (
                  <li key={x.id}>
                    <Link href={`/consultations/${x.id}`} className="block rounded-2xl border border-line p-3 transition hover:border-ink-300">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink-900">{x.doctorName}</p>
                        <Badge tone={x.status === "confirmed" ? "success" : "sun"}>{x.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {formatDate(x.date, { weekday: "short", day: "numeric", month: "short" })} · {x.timeSlot} {x.timezone}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card p-5">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <Bell size={18} className="text-brand-600" aria-hidden /> Recent activity
            </p>
            {notifications.length === 0 ? (
              <p className="mt-3 text-sm text-ink-500">Nothing yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link || "#"} className="block text-sm text-ink-700 hover:text-ink-900">
                      {n.message}
                      <span className="block text-xs text-ink-400">{formatDateTime(n.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <Link href="/account" className="block text-center text-sm font-semibold text-ink-500 hover:text-ink-900">
            Account settings & privacy
          </Link>
        </aside>
      </div>
    </>
  );
}
