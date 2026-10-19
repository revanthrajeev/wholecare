import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, ShieldCheck, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import PrintButton from "@/components/PrintButton";
import { formatDate } from "@/components/ui/core";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase } from "@/lib/access";

export const dynamic = "force-dynamic";
export const metadata = { title: "Price-lock certificate", robots: { index: false } };

export default async function QuoteCertificate({ params }) {
  const { id } = await params;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user) redirect(`/login?next=/quote/${id}`);
  const q = db.quotations.find((x) => x.id === id);
  const c = q && db.cases.find((x) => x.id === q.caseId);
  if (!q || !canViewCase(user, c) || (user.role === "hospital" && user.hospitalId !== q.hospitalId)) notFound();
  const h = db.hospitals.find((x) => x.id === q.hospitalId);
  const locked = q.status === "accepted";
  const back = user.role === "hospital" ? `/hospital/${user.hospitalId}/case/${c.id}` : `/case/${c.id}?tab=quotes`;

  return (
    <section className="min-h-screen bg-surface pb-16 pt-28 print:bg-white print:pt-0">
      <div className="container-wc max-w-3xl">
        <div className="mb-5 flex items-center justify-between" data-no-print>
          <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} aria-hidden /> Back to case
          </Link>
          <PrintButton />
        </div>
        <article className="card overflow-hidden print:border-0 print:shadow-none">
          <header className="flex items-start justify-between gap-4 bg-ink-900 px-8 py-7 text-white print:bg-white print:text-ink-900">
            <div>
              <Logo dark />
              <p className="mt-6 eyebrow text-glow print:text-brand-700">{locked ? "Price-lock certificate" : "Quotation"}</p>
              <h1 className="mt-1 text-2xl font-bold">{q.procedure}</h1>
            </div>
            {locked && (
              <div className="rounded-2xl border border-white/20 px-4 py-3 text-right print:border-ink-200">
                <LockKeyhole size={18} className="ml-auto text-glow print:text-brand-700" aria-hidden />
                <p className="mt-2 font-mono text-sm font-semibold">{q.lockCode}</p>
                <p className="text-xs text-ink-300 print:text-ink-500">Locked {formatDate(q.acceptedAt)}</p>
              </div>
            )}
          </header>
          <div className="space-y-8 px-8 py-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Patient</p>
                <p className="mt-1 font-semibold text-ink-900">{c.patientName}</p>
                <p className="text-sm text-ink-500">{c.countryOfResidence}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Hospital</p>
                <p className="mt-1 font-semibold text-ink-900">{h?.name}</p>
                <p className="text-sm text-ink-500">
                  {h?.city}, {h?.country} · {h?.accreditations?.join(", ")}
                </p>
                {q.doctorName && <p className="text-sm text-ink-500">Treating doctor: {q.doctorName}</p>}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="py-2 font-semibold">Item</th>
                  <th className="py-2 text-right font-semibold">USD</th>
                </tr>
              </thead>
              <tbody>
                {q.lineItems.map((l) => (
                  <tr key={l.label} className="border-b border-line">
                    <td className="py-2.5 text-ink-700">{l.label}</td>
                    <td className="py-2.5 text-right tabular-nums text-ink-900">${l.amountUSD.toLocaleString("en-US")}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-4 font-bold text-ink-900">Total</td>
                  <td className="pt-4 text-right font-display text-2xl font-bold tabular-nums text-ink-900">${q.totalUSD.toLocaleString("en-US")}</td>
                </tr>
              </tbody>
            </table>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Included</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-700">
                  {q.hospitalStayDays > 0 && <li>• {q.hospitalStayDays} nights in hospital</li>}
                  {(q.inclusions || []).map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Not included</p>
                <p className="mt-2 text-sm text-ink-700">{q.exclusions || "—"}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-ink-50 p-5 text-sm text-ink-600">
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <ShieldCheck size={16} className="text-brand-700" aria-hidden /> Terms
              </p>
              <p className="mt-2">
                Issued {formatDate(q.createdAt)} · valid {q.validityDays} days{locked ? ` · locked until ${formatDate(q.lockedUntil)}` : ""}. This certificate records the hospital&rsquo;s quoted terms for the treatment described, based on the records shared. If new clinical findings on admission change the plan, the hospital must issue a revised quote for the patient to accept before any change applies. This is not an insurance policy; payment is made to the hospital under its own terms.
              </p>
            </div>
            <p className="text-xs text-ink-400">
              Reference {q.id} · Case {c.id} · Generated by Whole Care
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
