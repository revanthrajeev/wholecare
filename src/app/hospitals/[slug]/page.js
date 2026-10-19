import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, MapPin, Clock, Languages, BedDouble, CalendarClock, CheckCircle2, CircleDashed, ShieldCheck, ArrowRight, Plane, Car, Hotel, MessagesSquare, UtensilsCrossed, Landmark, Sparkles, Quote } from "lucide-react";
import { Breadcrumbs, Badge, Button, HospitalCover, RatingPill, SampleBadge, Stars, formatDate } from "@/components/ui/core";
import { Price, PriceRange } from "@/components/ui/client";
import { DoctorCard, PackageCard } from "@/components/cards";
import CompareToggle from "@/components/CompareToggle";
import ReviewForm from "@/components/ReviewForm";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getHospitalBySlug, getPublicDoctors, getPublicPackages, getPublishedReviews } from "@/lib/data";
import { TREATMENTS, treatmentBySlug } from "@/content/treatments";
import { destinationByCountry } from "@/content/destinations";

export const dynamic = "force-dynamic";

const SERVICE_ICONS = { "Airport pickup": Car, "San Diego airport shuttle": Car, Interpreters: MessagesSquare, "Visa invitation letter": Landmark, "Visa support letter": Landmark, "Medical visa sponsorship": Landmark, "Accommodation help": Hotel, "Hotel desk": Hotel, "Recovery hotel": Hotel, "Partner residency suites": Hotel, "Family suites": Hotel, "Halal meals": UtensilsCrossed };

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const h = getHospitalBySlug(slug);
  if (!h) return { title: "Hospital not found" };
  return { title: `${h.name}, ${h.city}`, description: `${h.name} in ${h.city}, ${h.country}: ${h.specialties.join(", ")}. ${h.accreditations.join(", ")}. Verification status, doctors, packages and reviews.` };
}

const CHECKS = [
  ["license", "Operating licence confirmed"],
  ["accreditation", "Accreditation certificates checked"],
  ["intlDesk", "International patient desk confirmed"],
  ["siteVisit", "Site visit by Whole Care team"],
];

export default async function HospitalPage({ params }) {
  const { slug } = await params;
  const db = readDb();
  const h = getHospitalBySlug(slug, db);
  if (!h) notFound();
  const user = await getCurrentUser(db);
  const doctors = getPublicDoctors(db).filter((d) => d.hospitalId === h.id);
  const packages = getPublicPackages(db).filter((p) => p.hospitalId === h.id);
  const reviews = getPublishedReviews(db, h.id);
  const dest = destinationByCountry(h.country);
  const treatments = TREATMENTS.filter((t) => h.specialties.includes(t.specialty) && (t.prices[h.country] || t.priceOnAssessment));

  let reviewCase = null;
  if (user?.role === "patient") {
    reviewCase = db.cases.find((c) => c.ownerId === user.id && c.stage === "Completed" && (c.sentToHospitals || []).includes(h.id) && !(db.reviews || []).some((r) => r.caseId === c.id));
  }

  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: h.name,
    address: { "@type": "PostalAddress", addressLocality: h.city, addressCountry: h.country },
    medicalSpecialty: h.specialties,
    geo: { "@type": "GeoCoordinates", latitude: h.lat, longitude: h.lng },
  };
  const d = 0.05;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${h.lng - d}%2C${h.lat - d}%2C${h.lng + d}%2C${h.lat + d}&layer=mapnik&marker=${h.lat}%2C${h.lng}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative grid grid-cols-1 gap-10 pb-14 pt-28 md:pt-32 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <Breadcrumbs dark items={[{ label: "Home", href: "/" }, { label: "Hospitals", href: "/hospitals" }, { label: h.name }]} />
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {h.accreditations.map((a) => (
                <Badge key={a} tone="dark" icon={ShieldCheck}>
                  {a}
                </Badge>
              ))}
              {h.sample && <SampleBadge className="bg-white/90" />}
            </div>
            <h1 className="mt-4 flex items-start gap-3 text-4xl font-bold leading-tight md:text-5xl">
              {h.name}
              <BadgeCheck size={30} className="mt-2 shrink-0 text-glow" aria-label="Verified" />
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} aria-hidden /> {h.city}, {h.country}
              </span>
              <RatingPill rating={h.rating} count={h.reviewCount} dark />
              {h.responseHours && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} aria-hidden /> Replies in ~{h.responseHours}h
                </span>
              )}
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-200">{h.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/get-quote?hospital=${h.slug}`} variant="accent" size="lg">
                Request a quote <ArrowRight size={18} aria-hidden />
              </Button>
              <CompareToggle slug={h.slug} dark />
            </div>
          </div>
          <div className="relative">
            <HospitalCover hospital={h} className="aspect-[4/3] w-full rounded-[28px] ring-1 ring-white/15" priority sizes="(max-width: 1024px) 100vw, 560px" />
            <div className="absolute -bottom-5 left-5 right-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-ink-950/80 p-3 text-center text-sm backdrop-blur-xl sm:left-8 sm:right-8">
              <div>
                <p className="font-display text-xl font-bold">{h.beds}</p>
                <p className="text-[11px] text-ink-300">Beds</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold">{h.established}</p>
                <p className="text-[11px] text-ink-300">Established</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold">{h.doctorCount}</p>
                <p className="text-[11px] text-ink-300">Listed doctors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-wc grid grid-cols-1 gap-10 py-16 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-ink-900">Highlights</h2>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {h.highlights.map((x) => (
                <li key={x} className="card flex gap-3 p-4 text-sm text-ink-700">
                  <Sparkles size={18} className="shrink-0 text-brand-600" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </section>

          <section id="treatments">
            <h2 className="text-2xl font-bold text-ink-900">Treatments & indicative prices in {h.country}</h2>
            <p className="mt-1 text-sm text-ink-500">Country-level ranges for planning. This hospital&rsquo;s own quote follows a review of your reports.</p>
            <div className="card mt-5 divide-y divide-line">
              {treatments.map((t) => (
                <Link key={t.slug} href={`/treatments/${t.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-ink-50">
                  <span>
                    <span className="block font-semibold text-ink-900">{t.name}</span>
                    <span className="block text-xs text-ink-500">
                      {t.specialty} · stay {t.hospitalStay}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-semibold text-ink-900">
                    {t.priceOnAssessment ? "After review" : <PriceRange low={t.prices[h.country][0]} high={t.prices[h.country][1]} />}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900">International patient services</h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {h.services.map((s) => {
                const Icon = SERVICE_ICONS[s] || CheckCircle2;
                return (
                  <div key={s} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink-700">
                    <Icon size={18} className="text-brand-600" aria-hidden /> {s}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-500">
              <Languages size={16} aria-hidden /> Languages: {h.languages.join(", ")}
            </p>
          </section>

          {doctors.length > 0 && (
            <section id="doctors">
              <h2 className="text-2xl font-bold text-ink-900">Doctors</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {doctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} />
                ))}
              </div>
            </section>
          )}

          {packages.length > 0 && (
            <section id="packages">
              <h2 className="text-2xl font-bold text-ink-900">Packages</h2>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {packages.map((p) => (
                  <PackageCard key={p.id} pkg={p} treatmentName={treatmentBySlug(p.treatmentSlug)?.name} />
                ))}
              </div>
            </section>
          )}

          <section id="reviews">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-ink-900">Patient reviews</h2>
              {reviews.some((r) => r.sample) && <p className="text-xs text-ink-400">Reviews marked &ldquo;Sample&rdquo; are demonstration content.</p>}
            </div>
            {reviews.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                <div className="card h-fit p-5">
                  <p className="font-display text-4xl font-bold text-ink-900">{h.rating?.toFixed(1)}</p>
                  <Stars rating={h.rating} />
                  <p className="mt-1 text-xs text-ink-500">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
                  <div className="mt-4 space-y-1.5">
                    {breakdown.map((b) => (
                      <div key={b.n} className="flex items-center gap-2 text-xs text-ink-500">
                        <span className="w-3">{b.n}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <span className="block h-full rounded-full bg-sun-500" style={{ width: `${(b.count / reviews.length) * 100}%` }} />
                        </span>
                        <span className="w-4 text-right">{b.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <figure key={r.id} className="card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <Stars rating={r.rating} />
                        {r.verified ? <Badge tone="success" icon={BadgeCheck}>Verified patient</Badge> : r.sample ? <SampleBadge /> : null}
                      </div>
                      <blockquote className="mt-3 text-ink-700">
                        <Quote size={16} className="mb-1 text-brand-200" aria-hidden />
                        {r.text}
                      </blockquote>
                      <figcaption className="mt-3 text-xs text-ink-500">
                        {r.author} · {r.country} · {r.procedure} · {formatDate(r.date, { month: "short", year: "numeric" })}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-ink-500">No reviews yet.</p>
            )}
            {reviewCase && (
              <div className="mt-6">
                <ReviewForm hospitalId={h.id} caseId={reviewCase.id} procedure={treatmentBySlug(reviewCase.treatmentSlug)?.name || reviewCase.specialty} />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink-900">Location</h2>
            <div className="mt-5 overflow-hidden rounded-[24px] border border-line">
              <iframe title={`Map of ${h.city}`} src={mapSrc} className="h-72 w-full" loading="lazy" referrerPolicy="no-referrer" />
            </div>
            <p className="mt-2 text-xs text-ink-400">Map shows the city area. Exact address is shared with your case once the hospital accepts it.</p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div id="verification" className="card p-6">
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <ShieldCheck size={18} className="text-brand-600" aria-hidden /> Verification
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {CHECKS.map(([k, label]) => (
                <li key={k} className="flex items-center gap-2.5">
                  {h.verification?.[k] ? <CheckCircle2 size={18} className="text-ok-600" aria-label="Checked" /> : <CircleDashed size={18} className="text-ink-300" aria-label="Pending" />}
                  <span className={h.verification?.[k] ? "text-ink-700" : "text-ink-400"}>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500">
              <CalendarClock size={14} aria-hidden /> Last verified {formatDate(h.lastVerified)}
            </p>
          </div>
          <div className="card p-6">
            <p className="font-bold text-ink-900">Plan your trip</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              {dest && (
                <>
                  <li className="flex gap-2">
                    <Plane size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
                    {dest.flightTimes.map((f) => `${f.from} ${f.hours}`).join(" · ")}
                  </li>
                  <li className="flex gap-2">
                    <Landmark size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
                    {dest.visa.type}
                  </li>
                  <li className="flex gap-2">
                    <BedDouble size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
                    Best time: {dest.bestTime}
                  </li>
                </>
              )}
            </ul>
            {dest && (
              <Link href={`/countries/${dest.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                {dest.country} travel guide <ArrowRight size={14} aria-hidden />
              </Link>
            )}
          </div>
          <div className="card bg-ink-900 p-6 text-white">
            <p className="font-display text-lg font-bold">Get this hospital&rsquo;s quote</p>
            <p className="mt-1 text-sm text-ink-300">Send your reports once — the hospital replies with an itemized quote, usually within {h.responseHours ? `~${h.responseHours} hours` : "a few days"}.</p>
            <Button href={`/get-quote?hospital=${h.slug}`} variant="accent" className="mt-4 w-full">
              Request a quote
            </Button>
            {doctors[0] && (
              <p className="mt-3 text-center text-xs text-ink-400">
                Or <Link href={`/consult?doctor=${doctors[0].slug}`} className="text-glow hover:underline">book a video consult</Link> from <Price usd={Math.min(...doctors.map((x) => x.consultFeeUSD))} />
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
