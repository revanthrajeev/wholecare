import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { formatDate } from "@/components/ui/core";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase } from "@/lib/access";
import { treatmentBySlug } from "@/content/treatments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Visa invitation letter", robots: { index: false } };

export default async function VisaLetter({ params }) {
  const { id } = await params;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user) redirect(`/login?next=/case/${id}/visa-letter`);
  const c = db.cases.find((x) => x.id === id);
  if (!c || !canViewCase(user, c) || c.visaLetter?.status !== "issued") notFound();
  const h = db.hospitals.find((x) => x.id === c.visaLetter.issuedBy);
  const q = db.quotations.find((x) => x.id === c.acceptedQuoteId);
  const t = treatmentBySlug(c.treatmentSlug);
  const back = user.role === "hospital" ? `/hospital/${user.hospitalId}/case/${c.id}` : `/case/${c.id}?tab=travel`;
  const companions = c.travel?.companions || 0;

  return (
    <section className="min-h-screen bg-surface pb-16 pt-28 print:bg-white print:pt-0">
      <div className="container-wc max-w-3xl">
        <div className="mb-5 flex items-center justify-between" data-no-print>
          <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
            <ArrowLeft size={16} aria-hidden /> Back to case
          </Link>
          <PrintButton />
        </div>
        <article className="card px-10 py-12 text-[15px] leading-relaxed text-ink-800 print:border-0 print:shadow-none">
          <header className="flex items-start justify-between border-b-2 border-ink-900 pb-6">
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{h?.name}</p>
              <p className="text-sm text-ink-500">
                International Patient Department · {h?.city}, {h?.country}
              </p>
              <p className="text-sm text-ink-500">{h?.contactEmail}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-ink-900">Ref: {c.visaLetter.refNo}</p>
              <p className="text-ink-500">{formatDate(c.visaLetter.issuedAt, { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </header>
          <div className="mt-8 space-y-4">
            <p>To the Visa Officer,</p>
            <p>
              Embassy / High Commission of {h?.country}
            </p>
            <p className="font-semibold text-ink-900">Subject: Medical visa invitation for {c.patientName}</p>
            <p>
              This is to confirm that <strong>{c.patientName}</strong>
              {c.patientAge ? `, aged ${c.patientAge},` : ""} a resident of {c.countryOfResidence || "—"}, has been accepted for treatment at {h?.name}, {h?.city}, for <strong>{q?.procedure || t?.name || c.specialty}</strong>
              {q?.doctorName ? ` under the care of ${q.doctorName}` : ""}.
            </p>
            <p>
              The patient is expected to arrive on <strong>{c.travel?.arrivalDate ? formatDate(c.travel.arrivalDate, { day: "numeric", month: "long", year: "numeric" }) : "a date to be confirmed"}</strong>
              {t ? ` and will require an estimated stay of ${t.inCountry.toLowerCase()} in ${h?.country} for treatment and recovery` : ""}.
              {q ? ` The estimated cost of treatment is USD ${q.totalUSD.toLocaleString("en-US")}.` : ""}
            </p>
            {companions > 0 && <p>The patient will be accompanied by {companions} attendant{companions > 1 ? "s" : ""}{c.visaLetter.companions ? `: ${c.visaLetter.companions}` : ""}. We request that attendant visas be considered alongside the patient&rsquo;s application.</p>}
            <p>We kindly request that the necessary medical visa be granted. Please contact our International Patient Department for any verification.</p>
            <p className="pt-6">Yours faithfully,</p>
            <div className="pt-8">
              <p className="font-semibold text-ink-900">International Patient Department</p>
              <p className="text-sm text-ink-500">{h?.name}</p>
            </div>
          </div>
          {h?.sample && <p className="mt-10 rounded-xl bg-sun-50 p-3 text-center text-xs font-semibold text-sun-700">DEMONSTRATION DOCUMENT — sample hospital listing, not valid for visa applications.</p>}
          <p className="mt-6 text-center text-[11px] text-ink-400">Issued via Whole Care · Case {c.id}</p>
        </article>
      </div>
    </section>
  );
}
