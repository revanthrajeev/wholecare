import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Clock, Languages, Video, ArrowUpRight, Plane, BedDouble, HeartPulse, Bone, Activity, Ribbon, HandHeart, Brain, Baby, Scale, Eye, Smile, Sparkles, Scissors } from "lucide-react";
import { Avatar, Badge, HospitalCover, RatingPill, SampleBadge, cn } from "@/components/ui/core";
import { Price } from "@/components/ui/client";
import { priceSummary } from "@/content/treatments";
import { specialtyByName } from "@/content/specialties";

const SPECIALTY_ICONS = { HeartPulse, Bone, Activity, Ribbon, HandHeart, Brain, Baby, Scale, Eye, Smile, Sparkles, Scissors };
export function SpecialtyIcon({ name, size = 18, className }) {
  const Icon = SPECIALTY_ICONS[specialtyByName(name)?.icon] || HeartPulse;
  return <Icon size={size} aria-hidden className={className} />;
}

export function HospitalCard({ hospital: h, footer, priority }) {
  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
      <div className="relative">
        <HospitalCover hospital={h} className="h-44 w-full" priority={priority} />
        <div className="absolute left-3 top-3 flex gap-1.5" style={{ left: h.image ? undefined : "4.25rem" }}>
          {h.accreditations?.slice(0, 2).map((a) => (
            <Badge key={a} tone="dark" className="backdrop-blur">
              {a.replace(" licensed", "").replace(" certified", "")}
            </Badge>
          ))}
        </div>
        {h.sample && <SampleBadge className="absolute right-3 top-3 bg-white/90" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-ink-900">
            <Link href={`/hospitals/${h.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
              {h.name}
            </Link>
          </h3>
          {h.verified && <BadgeCheck size={20} className="mt-0.5 shrink-0 text-brand-600" aria-label="Verified" />}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
          <MapPin size={14} aria-hidden /> {h.city}, {h.country}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {h.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
              {s}
            </span>
          ))}
          {h.specialties.length > 3 && <span className="rounded-full px-1 py-1 text-xs text-ink-400">+{h.specialties.length - 3}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm">
          <RatingPill rating={h.rating} count={h.reviewCount} />
          {h.responseHours ? (
            <span className="inline-flex items-center gap-1 text-xs text-ink-500">
              <Clock size={13} aria-hidden /> Replies in ~{h.responseHours}h
            </span>
          ) : null}
        </div>
        {footer && <div className="relative z-10 mt-4 border-t border-line pt-4">{footer}</div>}
      </div>
    </article>
  );
}

export function DoctorCard({ doctor: d, compact }) {
  return (
    <article className="card card-hover relative flex h-full min-w-0 flex-col p-5">
      <div className="flex items-start gap-4">
        <Avatar name={d.name} src={d.image} size={compact ? 56 : 68} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold leading-snug text-ink-900">
              <Link href={`/doctors/${d.slug}`} className="after:absolute after:inset-0 hover:text-brand-700">
                {d.name}
              </Link>
            </h3>
            {d.sample && <SampleBadge />}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-brand-700">{d.specialty}</p>
          <p className="mt-0.5 truncate text-xs text-ink-500">{d.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-600">
        {d.hospital?.name} · {d.hospital?.city}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
        <span>{d.experienceYears} yrs experience</span>
        <span className="inline-flex items-center gap-1">
          <Languages size={13} aria-hidden /> {d.languages.slice(0, 3).join(", ")}
        </span>
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.procedures.slice(0, 3).map((p) => (
            <span key={p} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs text-ink-600">
              {p}
            </span>
          ))}
        </div>
      )}
      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm text-ink-500">
          Video consult <span className="font-semibold text-ink-900"><Price usd={d.consultFeeUSD} /></span>
        </span>
        <Link href={`/consult?doctor=${d.slug}`} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-100">
          <Video size={13} aria-hidden /> Book
        </Link>
      </div>
    </article>
  );
}

export function TreatmentCard({ treatment: t }) {
  const s = priceSummary(t);
  return (
    <article className="card card-hover group relative flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
          <SpecialtyIcon name={t.specialty} />
        </span>
        <ArrowUpRight size={18} className="text-ink-300 transition group-hover:text-brand-700" aria-hidden />
      </div>
      <h3 className="mt-4 font-bold leading-snug text-ink-900">
        <Link href={`/treatments/${t.slug}`} className="after:absolute after:inset-0">
          {t.name}
        </Link>
      </h3>
      <p className="mt-1 text-xs font-medium text-ink-400">{t.specialty}</p>
      <p className="mt-2 line-clamp-2 text-sm text-ink-500">{t.summary}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        {s ? (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-400">From</p>
            <p className="font-display text-xl font-bold text-ink-900">
              <Price usd={s.fromUSD} />
            </p>
          </div>
        ) : (
          <p className="text-sm font-semibold text-ink-700">Priced after review</p>
        )}
        {s?.savingPct ? <Badge tone="brand">~{s.savingPct}% below US</Badge> : null}
      </div>
    </article>
  );
}

export function DestinationCard({ destination: d, from }) {
  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-ink-900" style={d.image ? undefined : { background: `linear-gradient(135deg, #0b2545 0%, ${d.accent[0]} 140%)` }}>
        {d.image && <Image src={d.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover object-[72%_50%] transition duration-500 group-hover:scale-[1.04]" />}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
        <p className="absolute bottom-3 left-5 font-display text-2xl font-bold text-white">{d.country}</p>
        <span className="absolute right-4 top-4 rounded-full bg-ink-950/40 px-2 py-0.5 text-xs font-bold tracking-widest text-white ring-1 ring-white/25 backdrop-blur">{d.code}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-ink-600">{d.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.strengths.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-ink-50 px-2.5 py-1 text-xs text-ink-600">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <span className="inline-flex items-center gap-1 text-ink-500">
            <Plane size={14} aria-hidden /> {d.flightTimes[0].from} {d.flightTimes[0].hours}
          </span>
          {from != null && (
            <span className="text-ink-500">
              Knee from <span className="font-semibold text-ink-900"><Price usd={from} /></span>
            </span>
          )}
        </div>
        <Link href={`/countries/${d.slug}`} className="after:absolute after:inset-0">
          <span className="sr-only">{d.country} guide</span>
        </Link>
      </div>
    </article>
  );
}

export function PackageCard({ pkg: p, treatmentName }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{treatmentName}</p>
          <h3 className="mt-1 text-lg font-bold text-ink-900">{p.title}</h3>
          <p className="mt-1 text-sm text-ink-500">
            <Link href={`/hospitals/${p.hospital.slug}`} className="hover:text-ink-900 hover:underline">
              {p.hospital.name}
            </Link>{" "}
            · {p.hospital.city}, {p.hospital.country}
          </p>
        </div>
        {p.sample && <SampleBadge />}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <p className="font-display text-3xl font-bold text-ink-900">
          <Price usd={p.priceUSD} />
        </p>
        <p className="pb-1 text-xs text-ink-500">fixed package price</p>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-ink-500">
        {p.hospitalNights > 0 && (
          <span className="inline-flex items-center gap-1">
            <BedDouble size={13} aria-hidden /> {p.hospitalNights} hospital nights
          </span>
        )}
        {p.hotelNights > 0 && <span>{p.hotelNights} hotel nights</span>}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-ink-600">
        {p.includes.map((i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            {i}
          </li>
        ))}
      </ul>
      {p.excludes?.length > 0 && <p className="mt-3 text-xs text-ink-400">Not included: {p.excludes.join(", ")}</p>}
      <div className="mt-auto pt-5">
        <Link href={`/get-quote?treatment=${p.treatmentSlug}&package=${p.id}&hospital=${p.hospital.slug}`} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-800">
          Request this package
        </Link>
      </div>
    </article>
  );
}

