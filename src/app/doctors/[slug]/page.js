import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, Languages, GraduationCap, Stethoscope, CalendarDays, MapPin } from "lucide-react";
import { Avatar, Breadcrumbs, Badge, SampleBadge } from "@/components/ui/core";
import { DoctorCard } from "@/components/cards";
import BookingWidget from "@/components/BookingWidget";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDoctorBySlug, getPublicDoctors } from "@/lib/data";
import { TREATMENTS } from "@/content/treatments";
import { destinationByCountry } from "@/content/destinations";

export const dynamic = "force-dynamic";
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = getDoctorBySlug(slug);
  if (!d) return { title: "Doctor not found" };
  return { title: `${d.name} — ${d.specialty}, ${d.hospital.name}`, description: `${d.name} (${d.title}), ${d.experienceYears} years' experience. Book a video consultation.` };
}

export default async function DoctorPage({ params }) {
  const { slug } = await params;
  const db = readDb();
  const d = getDoctorBySlug(slug, db);
  if (!d) notFound();
  const user = await getCurrentUser(db);
  const dest = destinationByCountry(d.hospital.country);
  const peers = getPublicDoctors(db).filter((x) => x.specialty === d.specialty && x.id !== d.id).slice(0, 2);
  const treatments = TREATMENTS.filter((t) => d.procedures.includes(t.name));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: d.name,
    medicalSpecialty: d.specialty,
    knowsLanguage: d.languages,
    worksFor: { "@type": "Hospital", name: d.hospital.name, address: { "@type": "PostalAddress", addressLocality: d.hospital.city, addressCountry: d.hospital.country } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero-night relative overflow-hidden text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative pb-14 pt-28 md:pt-32">
          <Breadcrumbs dark items={[{ label: "Home", href: "/" }, { label: "Doctors", href: "/doctors" }, { label: d.name }]} />
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={d.name} src={d.image} size={112} className="ring-4 ring-white/15" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="dark">{d.specialty}</Badge>
                {d.sample && <SampleBadge className="bg-white/90" />}
              </div>
              <h1 className="mt-3 text-4xl font-bold md:text-5xl">{d.name}</h1>
              <p className="mt-2 text-ink-300">{d.title}</p>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-300">
                <Link href={`/hospitals/${d.hospital.slug}`} className="inline-flex items-center gap-1.5 hover:text-white">
                  <Building2 size={15} aria-hidden /> {d.hospital.name}
                </Link>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden /> {d.hospital.city}, {d.hospital.country}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages size={15} aria-hidden /> {d.languages.join(", ")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-wc grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-ink-900">About</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-600">{d.bio}</p>
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="card p-4">
                <dt className="text-xs text-ink-500">Experience</dt>
                <dd className="font-display text-2xl font-bold text-ink-900">{d.experienceYears} yrs</dd>
              </div>
              <div className="card p-4">
                <dt className="text-xs text-ink-500">Consults on</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{d.availability.days.map((x) => DAY[x]).join(", ")}</dd>
              </div>
              <div className="card p-4">
                <dt className="text-xs text-ink-500">Local time</dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{dest?.timezone}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
              <Stethoscope size={20} className="text-brand-600" aria-hidden /> Procedures
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {d.procedures.map((p) => {
                const t = treatments.find((x) => x.name === p);
                return t ? (
                  <Link key={p} href={`/treatments/${t.slug}`} className="rounded-full bg-brand-50 px-3.5 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100">
                    {p}
                  </Link>
                ) : (
                  <span key={p} className="rounded-full bg-ink-50 px-3.5 py-2 text-sm text-ink-700">
                    {p}
                  </span>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
              <GraduationCap size={20} className="text-brand-600" aria-hidden /> Qualifications
            </h2>
            <ul className="mt-4 space-y-2">
              {d.title.split(",").map((q) => (
                <li key={q} className="flex items-center gap-3 text-ink-700">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {q.trim()}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-400">Registration details are verified by the hospital as part of its listing checks.</p>
          </section>
          {peers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-ink-900">Other {d.specialty.toLowerCase()} specialists</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {peers.map((p) => (
                  <DoctorCard key={p.id} doctor={p} compact />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget doctor={d} user={user} />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <CalendarDays size={12} aria-hidden /> Need a written opinion instead? <Link href="/second-opinion" className="font-semibold text-brand-700 hover:underline">Request a second opinion</Link>
          </p>
        </aside>
      </div>
    </>
  );
}
