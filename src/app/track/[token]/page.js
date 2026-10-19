import { notFound } from "next/navigation";
import { HeartPulse, MapPin, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import { ProgressRail, formatDateTime } from "@/components/ui/core";
import { readDb } from "@/lib/db";
import { CASE_STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Family updates", robots: { index: false, follow: false } };

const PUBLIC_KINDS = new Set(["hospital", "coordinator"]);

export default async function FamilyTracker({ params }) {
  const { token } = await params;
  if (!/^fam-[a-zA-Z0-9-]{6,40}$/.test(token)) notFound();
  const db = readDb();
  const c = db.cases.find((x) => x.share?.enabled && x.share.token === token);
  if (!c) notFound();
  const accepted = c.acceptedQuoteId ? db.quotations.find((q) => q.id === c.acceptedQuoteId) : null;
  const h = accepted ? db.hospitals.find((x) => x.id === accepted.hospitalId) : null;
  const first = c.patientName.split(" ")[0];
  // Milestones only: hospital and coordinator updates, never documents, messages or prices.
  const events = c.timeline_events.filter((e) => PUBLIC_KINDS.has(e.kind) && !/quot|price|\$/i.test(e.label)).slice().reverse();

  return (
    <section className="hero-night min-h-screen pb-16 pt-28 text-white">
      <div className="container-wc max-w-2xl">
        <Logo dark />
        <p className="eyebrow mt-10 text-glow">Family updates</p>
        <h1 className="mt-2 text-4xl font-bold">{first}&rsquo;s care journey</h1>
        {h && (
          <p className="mt-2 flex items-center gap-2 text-ink-300">
            <MapPin size={16} aria-hidden /> {h.name}, {h.city}
          </p>
        )}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 pb-12 backdrop-blur [&_span]:!text-ink-200">
          <p className="mb-5 flex items-center gap-2 font-semibold">
            <HeartPulse size={18} className="text-glow" aria-hidden /> Current stage: {c.stage}
          </p>
          <ProgressRail steps={CASE_STAGES} current={c.stage} />
        </div>
        <div className="mt-6 rounded-3xl bg-white p-6 text-ink-900">
          <p className="font-bold">Latest updates</p>
          {events.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">Updates from the hospital will appear here.</p>
          ) : (
            <ol className="mt-5 space-y-5 border-l-2 border-brand-100 pl-5">
              {events.map((e, i) => (
                <li key={`${e.at}-${i}`} className="relative">
                  <CheckCircle2 size={18} className="absolute -left-[31px] top-0 rounded-full bg-white text-brand-600" aria-hidden />
                  <p className="text-sm font-semibold">{e.label}</p>
                  <p className="text-xs text-ink-500">{formatDateTime(e.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">Shared privately by {first}. Medical records, messages and prices are never shown here.</p>
      </div>
    </section>
  );
}
