import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, AlertCircle, Plane, Landmark, Coins, Languages, Clock, Sun, ShieldCheck, ArrowRight } from "lucide-react";
import { Breadcrumbs, Button, SectionHeading } from "@/components/ui/core";
import { PriceRange } from "@/components/ui/client";
import { HospitalCard } from "@/components/cards";
import { getPublicHospitals } from "@/lib/data";
import { DESTINATIONS, destinationBySlug } from "@/content/destinations";
import { TREATMENTS, PRICE_DISCLAIMER } from "@/content/treatments";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) return { title: "Destination not found" };
  return { title: `Medical travel to ${d.country}: costs, visas & hospitals`, description: `${d.tagline} Visa basics, flight times, accreditation, indicative prices and verified hospitals in ${d.country}.` };
}

export default async function CountryGuide({ params }) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  if (!d) notFound();
  const hospitals = getPublicHospitals().filter((h) => h.country === d.country);
  const treatments = TREATMENTS.filter((t) => t.prices[d.country]).sort((a, b) => (d.strengths.includes(b.specialty) ? 1 : 0) - (d.strengths.includes(a.specialty) ? 1 : 0));
  const others = DESTINATIONS.filter((x) => x.slug !== d.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <Image src={d.image} alt={`${d.country} at dusk`} fill priority sizes="100vw" className="object-cover object-[70%_50%]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/10" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-ink-950/50" />
        <div aria-hidden className="absolute inset-0 bg-ink-950/45 md:hidden" />
        <div className="container-wc relative pb-16 pt-28 md:pt-32">
          <Breadcrumbs dark items={[{ label: "Home", href: "/" }, { label: "Destinations", href: "/countries" }, { label: d.country }]} />
          <p className="eyebrow mt-8 text-glow">Destination guide</p>
          <h1 className="mt-3 text-5xl font-bold md:text-6xl">{d.country}</h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-ink-200">{d.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/get-quote?destination=${encodeURIComponent(d.country)}`} variant="accent" size="lg">
              Get quotes in {d.country} <ArrowRight size={18} aria-hidden />
            </Button>
            <Button href={`/countries/compare?countries=${d.slug}`} variant="ghostDark" size="lg">
              Compare with other countries
            </Button>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [Plane, "Flights", d.flightTimes.slice(0, 2).map((f) => `${f.from} ${f.hours}`).join(" · ")],
              [Landmark, "Visa", d.visa.type.split(";")[0]],
              [Sun, "Best time", d.bestTime],
              [ShieldCheck, "Accreditation", d.accreditation.join(", ")],
            ].map(([Icon, label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <Icon size={16} className="text-glow" aria-hidden />
                <dt className="mt-2 text-xs text-ink-300">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container-wc grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          <section>
            <p className="text-[17px] leading-relaxed text-ink-600">{d.summary}</p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="card p-6">
                <h2 className="font-bold text-ink-900">Why patients choose {d.country}</h2>
                <ul className="mt-4 space-y-3 text-sm text-ink-700">
                  {d.whyChoose.map((w) => (
                    <li key={w} className="flex gap-2.5">
                      <Check size={18} className="shrink-0 text-ok-600" aria-hidden /> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <h2 className="font-bold text-ink-900">Worth knowing</h2>
                <ul className="mt-4 space-y-3 text-sm text-ink-700">
                  {d.considerations.map((w) => (
                    <li key={w} className="flex gap-2.5">
                      <AlertCircle size={18} className="shrink-0 text-sun-700" aria-hidden /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900">Indicative prices in {d.country}</h2>
            <div className="card mt-5 divide-y divide-line">
              {treatments.map((t) => (
                <Link key={t.slug} href={`/treatments/${t.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-ink-50">
                  <span>
                    <span className="block font-semibold text-ink-900">{t.name}</span>
                    <span className="block text-xs text-ink-500">
                      {t.specialty}
                      {d.strengths.includes(t.specialty) && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-800">A {d.country} strength</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                    <PriceRange low={t.prices[d.country][0]} high={t.prices[d.country][1]} />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-400">{PRICE_DISCLAIMER}</p>
          </section>

          {hospitals.length > 0 && (
            <section>
              <SectionHeading title={`Verified hospitals in ${d.country}`} className="max-w-none" />
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {hospitals.map((h) => (
                  <HospitalCard key={h.id} hospital={h} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <Landmark size={18} className="text-brand-600" aria-hidden /> Visa basics
            </p>
            <p className="mt-3 text-sm font-semibold text-ink-800">{d.visa.type}</p>
            <p className="mt-1 text-sm text-ink-600">{d.visa.duration}</p>
            <p className="mt-2 text-sm text-ink-500">{d.visa.notes}</p>
            <p className="mt-4 rounded-xl bg-sun-50 p-3 text-xs text-sun-700">Rules change — confirm requirements for your passport on the official government portal before booking.</p>
            <Link href="/guides/medical-visa-basics" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              Medical visa guide <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <div className="card p-6">
            <p className="font-bold text-ink-900">Practical details</p>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                [Coins, "Currency", `${d.currency.name} (${d.currency.code})`],
                [Languages, "Language", d.languages],
                [Clock, "Time zone", d.timezone],
                [Plane, "Flight times", d.flightTimes.map((f) => `${f.from} ${f.hours}`).join(" · ")],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
                  <div>
                    <dt className="text-xs text-ink-500">{label}</dt>
                    <dd className="text-ink-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6">
            <p className="font-bold text-ink-900">Other destinations</p>
            <ul className="mt-3 space-y-1">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/countries/${o.slug}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                    {o.country} <ArrowRight size={14} className="text-ink-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
