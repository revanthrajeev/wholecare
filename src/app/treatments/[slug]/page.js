import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, Wallet, Clock4, Syringe, CheckCircle2, XCircle, MessageCircleQuestion, AlertTriangle, ArrowRight, Scale } from "lucide-react";
import { PageHeader, Button, SectionHeading } from "@/components/ui/core";
import { PriceRange, Price } from "@/components/ui/client";
import PriceChart from "@/components/PriceChart";
import { HospitalCard, DoctorCard, SpecialtyIcon } from "@/components/cards";
import { readDb } from "@/lib/db";
import { getPublicHospitals, getPublicDoctors, getPublicPackages } from "@/lib/data";
import { TREATMENTS, treatmentBySlug, priceSummary, PRICE_DISCLAIMER } from "@/content/treatments";
import { specialtyByName } from "@/content/specialties";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = treatmentBySlug(slug);
  if (!t) return { title: "Treatment not found" };
  const s = priceSummary(t);
  return {
    title: `${t.name} abroad — cost, stay and recovery`,
    description: s ? `${t.name} from about $${s.fromUSD.toLocaleString("en-US")}: compare indicative prices across ${Object.keys(t.prices).length} countries, hospital stay (${t.hospitalStay}) and time in country.` : t.summary,
  };
}

export default async function TreatmentPage({ params }) {
  const { slug } = await params;
  const t = treatmentBySlug(slug);
  if (!t) notFound();
  const db = readDb();
  const s = priceSummary(t);
  const hospitals = getPublicHospitals(db)
    .filter((h) => h.specialties.includes(t.specialty))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
  const doctors = getPublicDoctors(db).filter((d) => d.specialty === t.specialty).slice(0, 4);
  const packages = getPublicPackages(db).filter((p) => p.treatmentSlug === t.slug);
  const related = TREATMENTS.filter((x) => x.specialty === t.specialty && x.slug !== t.slug).slice(0, 3);
  const spec = specialtyByName(t.specialty);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: t.name,
    description: t.summary,
    howPerformed: t.about[0],
    ...(s ? { offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: s.fromUSD, highPrice: Math.max(...Object.values(t.prices).map((r) => r[1])) } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        eyebrow={t.specialty}
        title={t.name}
        description={t.summary}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Treatments", href: "/treatments" }, ...(spec ? [{ label: spec.name, href: `/treatments?specialty=${spec.slug}` }] : []), { label: t.name }]}
        actions={
          <>
            <Button href={`/get-quote?treatment=${t.slug}`} variant="accent" size="lg">
              Get exact quotes <ArrowRight size={18} aria-hidden />
            </Button>
            <Button href={`/second-opinion?treatment=${t.slug}`} variant="ghostDark" size="lg">
              Second opinion
            </Button>
          </>
        }
      >
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Wallet, label: "From", value: s ? <PriceRange low={s.cheapestRange[0]} high={s.cheapestRange[1]} /> : "After review", sub: s ? `in ${s.cheapestCountry}` : "Records review first" },
            { icon: BedDouble, label: "Hospital stay", value: t.hospitalStay },
            { icon: Clock4, label: "Time in country", value: t.inCountry },
            { icon: Syringe, label: "Anaesthesia", value: t.anesthesia },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <f.icon size={16} className="text-glow" aria-hidden />
              <p className="mt-2 text-xs text-ink-300">{f.label}</p>
              <p className="font-display text-lg font-bold text-white">{f.value}</p>
              {f.sub && <p className="text-xs text-ink-400">{f.sub}</p>}
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="container-wc grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          {!t.priceOnAssessment && (
            <section className="card p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">Indicative cost by country</h2>
                  {s?.savingPct ? <p className="mt-1 text-sm text-ink-500">Lowest typical range is about {s.savingPct}% below US list prices.</p> : null}
                </div>
                <Link href={`/countries/compare?treatment=${t.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
                  <Scale size={15} aria-hidden /> Compare destinations side by side
                </Link>
              </div>
              <PriceChart treatment={t} />
              <p className="mt-6 text-xs text-ink-400">{PRICE_DISCLAIMER}</p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold text-ink-900">About this treatment</h2>
            <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-ink-600">
              {t.about.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-ink-50 p-4">
                <dt className="text-xs text-ink-500">Recovery</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{t.recovery}</dd>
              </div>
              <div className="rounded-2xl bg-ink-50 p-4">
                <dt className="text-xs text-ink-500">Hospital stay</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{t.hospitalStay}</dd>
              </div>
              <div className="rounded-2xl bg-ink-50 p-4">
                <dt className="text-xs text-ink-500">Plan to stay in-country</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{t.inCountry}</dd>
              </div>
            </dl>
            {t.legalNote && (
              <p className="mt-6 flex gap-3 rounded-2xl border border-sun-100 bg-sun-50 p-4 text-sm text-sun-700">
                <AlertTriangle size={18} className="shrink-0" aria-hidden /> {t.legalNote}
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-ink-900">
                <CheckCircle2 size={18} className="text-ok-600" aria-hidden /> Usually included
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-600">
                {t.includes.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok-600" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="flex items-center gap-2 font-bold text-ink-900">
                <XCircle size={18} className="text-coral-500" aria-hidden /> Often excluded
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-600">
                {t.excludes.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-500" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
              <MessageCircleQuestion size={20} className="text-brand-700" aria-hidden /> Questions to ask your surgeon
            </h2>
            <ol className="mt-5 space-y-3">
              {t.questions.map((q, i) => (
                <li key={q} className="flex gap-3 text-ink-700">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">{i + 1}</span>
                  <span className="pt-0.5">{q}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink-500">
              Booking a video consult? Add these to your case and they&rsquo;ll be organised for the doctor in advance.
            </p>
          </section>

          {packages.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-ink-900">Fixed-price packages</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {packages.map((p) => (
                  <Link key={p.id} href="/packages" className="card card-hover flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold text-ink-900">{p.title}</p>
                      <p className="text-sm text-ink-500">
                        {p.hospital.name} · {p.hospital.country}
                      </p>
                    </div>
                    <span className="font-display text-xl font-bold text-ink-900"><Price usd={p.priceUSD} /></span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {hospitals.length > 0 && (
            <section>
              <SectionHeading eyebrow="Where" title={`Hospitals offering ${t.specialty.toLowerCase()}`} className="max-w-none" />
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {hospitals.map((h) => (
                  <HospitalCard key={h.id} hospital={h} />
                ))}
              </div>
            </section>
          )}

          {doctors.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-ink-900">Specialists you can consult</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {doctors.map((d) => (
                  <DoctorCard key={d.id} doctor={d} compact />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="bg-ink-900 p-6 text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-glow">
                <SpecialtyIcon name={t.specialty} />
              </span>
              <p className="mt-4 font-display text-xl font-bold">Get exact quotes for your case</p>
              <p className="mt-2 text-sm text-ink-300">Share your reports once. Verified hospitals reply with itemized quotes — free for patients.</p>
            </div>
            <div className="space-y-3 p-6">
              <Button href={`/get-quote?treatment=${t.slug}`} className="w-full">
                Get a free quote
              </Button>
              <Button href="/consult" variant="outline" className="w-full">
                Book a video consult
              </Button>
              <p className="text-center text-xs text-ink-400">No commitment. You choose which hospitals see your records.</p>
            </div>
          </div>
          {related.length > 0 && (
            <div className="card p-6">
              <p className="text-sm font-semibold text-ink-900">Related treatments</p>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/treatments/${r.slug}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                      {r.name}
                      <ArrowRight size={14} className="text-ink-400" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
