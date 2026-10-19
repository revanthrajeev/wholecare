"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, ArrowRight, Scale, Check, Clock, SlidersHorizontal, SearchX } from "lucide-react";
import { TREATMENTS, treatmentBySlug } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";
import { CURRENCIES } from "@/lib/currency";
import { Badge, Field, Input, Select, HospitalCover, RatingPill, SampleBadge, EmptyState, buttonClass, cn } from "@/components/ui/core";
import { PriceRange, useCurrency, api } from "@/components/ui/client";
import { useCompareList } from "@/components/HospitalsBrowser";

const TREATMENT_GROUPS = [...new Set(TREATMENTS.map((t) => t.specialty))].map((s) => [s, TREATMENTS.filter((t) => t.specialty === s)]);
const WEIGHT_LABELS = ["Not important", "Important", "Very important"];
const TONE = {
  good: { icon: CheckCircle2, cls: "bg-ok-50 text-ok-700" },
  neutral: { icon: Info, cls: "bg-ink-50 text-ink-600" },
  warn: { icon: AlertTriangle, cls: "bg-sun-50 text-sun-700" },
};

function ScoreRing({ score }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-16 w-16 shrink-0" role="img" aria-label={`Match score ${score} out of 100`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-ink-100)" strokeWidth="6" />
        <motion.circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-brand-600)" strokeWidth="6" strokeLinecap="round" initial={{ pathLength: reduce ? score / 100 : 0 }} animate={{ pathLength: score / 100 }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold tabular-nums text-ink-900">{score}</span>
    </div>
  );
}

function Weight({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-ink-700">{label}</span>
        <span className="text-xs text-ink-400">{WEIGHT_LABELS[value]}</span>
      </div>
      <input type="range" min="0" max="2" step="1" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-600" aria-label={`${label} importance`} aria-valuetext={WEIGHT_LABELS[value]} />
    </div>
  );
}

function MatchCard({ m, rank, treatment, compare }) {
  const h = m.hospital;
  const on = compare.ids.includes(h.slug);
  return (
    <motion.li layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="card overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row">
        <Link href={`/hospitals/${h.slug}`} className="relative block shrink-0 overflow-hidden rounded-2xl sm:w-44">
          <HospitalCover hospital={h} className="aspect-[16/10] w-full sm:aspect-[4/3]" sizes="(max-width: 640px) 100vw, 176px" />
          <span className="absolute left-2 top-2 rounded-full bg-ink-900/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur">#{rank}</span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/hospitals/${h.slug}`} className="font-display text-lg font-bold text-ink-900 hover:text-brand-700">
                  {h.name}
                </Link>
                {rank === 1 && <Badge tone="brand">Best match</Badge>}
                {h.sample && <SampleBadge />}
              </div>
              <p className="mt-0.5 text-sm text-ink-500">
                {h.city}, {h.country} · {h.accreditations.join(" · ")}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <RatingPill rating={h.rating} count={h.reviewCount} />
                {h.responseHours && (
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <Clock size={14} aria-hidden /> Replies in ~{h.responseHours}h
                  </span>
                )}
              </div>
            </div>
            <ScoreRing score={m.score} />
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Why it ranks here">
            {m.reasons.map((r) => {
              const tone = TONE[r.tone] || TONE.neutral;
              const Icon = tone.icon;
              return (
                <li key={r.text} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", tone.cls)}>
                  <Icon size={12} aria-hidden /> {r.text}
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="text-sm">
              {m.range ? (
                <>
                  <span className="text-ink-400">{treatment ? `${treatment.name} typically` : "Typically"} </span>
                  <PriceRange low={m.range[0]} high={m.range[1]} className="font-semibold text-ink-900" />
                </>
              ) : (
                <span className="text-ink-400">Priced after assessment</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => compare.toggle(h.slug)} aria-pressed={on} className={buttonClass({ variant: "outline", size: "sm" })}>
                {on ? <Check size={15} aria-hidden /> : <Scale size={15} aria-hidden />} {on ? "Comparing" : "Compare"}
              </button>
              <Link href={`/get-quote?hospital=${h.slug}${treatment ? `&treatment=${treatment.slug}` : ""}`} className={buttonClass({ size: "sm" })}>
                Get a quote <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export default function HospitalMatcher({ initialTreatment, initialDestination, languages }) {
  const { currency } = useCurrency();
  const rate = CURRENCIES[currency]?.rate || 1;
  const compare = useCompareList();
  const [treatmentSlug, setTreatmentSlug] = useState(initialTreatment || "total-knee-replacement");
  const [destination, setDestination] = useState(initialDestination || "any");
  const [budget, setBudget] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [language, setLanguage] = useState("");
  const [weights, setWeights] = useState({ price: 1, quality: 1, speed: 1 });
  const [result, setResult] = useState(null);

  const treatment = treatmentBySlug(treatmentSlug);
  const budgetUSD = Number(budget) > 0 ? Math.round(Number(budget) / rate) : null;
  // Priority weights 0/1/2 map to multipliers 0.25/1/2 so "not important" still breaks ties.
  const key = JSON.stringify({ treatmentSlug, destination, maxBudget: budgetUSD, minRating, language, priorities: Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, [0.25, 1, 2][v]])) });

  useEffect(() => {
    let alive = true;
    const id = setTimeout(() => {
      api("/api/match", { method: "POST", body: JSON.parse(key) })
        .then((r) => alive && setResult({ key, ...r }))
        .catch((e) => alive && setResult({ key, error: e.message, matches: [] }));
    }, 220);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [key]);

  const loading = !result || result.key !== key;
  const matches = result?.matches || [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
      <section className="card space-y-5 p-6 lg:sticky lg:top-24" aria-label="Your needs">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <SlidersHorizontal size={17} className="text-brand-600" aria-hidden /> Your needs
        </p>
        <Field label="Treatment" htmlFor="m-treatment">
          <Select id="m-treatment" value={treatmentSlug} onChange={(e) => setTreatmentSlug(e.target.value)}>
            {TREATMENT_GROUPS.map(([s, list]) => (
              <optgroup key={s} label={s}>
                {list.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>
        <Field label="Destination" htmlFor="m-dest">
          <Select id="m-dest" value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="any">Anywhere</option>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.country}>
                {d.country}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Treatment budget (${currency})`} htmlFor="m-budget" optional>
          <Input id="m-budget" type="number" min="0" step="500" inputMode="numeric" placeholder="e.g. 10000" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rating" htmlFor="m-rating">
            <Select id="m-rating" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value={0}>Any</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
            </Select>
          </Field>
          <Field label="Language" htmlFor="m-lang">
            <Select id="m-lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Any</option>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="space-y-4 rounded-2xl bg-ink-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">What matters most</p>
          <Weight label="Price" value={weights.price} onChange={(v) => setWeights((w) => ({ ...w, price: v }))} />
          <Weight label="Quality & ratings" value={weights.quality} onChange={(v) => setWeights((w) => ({ ...w, quality: v }))} />
          <Weight label="Fast replies" value={weights.speed} onChange={(v) => setWeights((w) => ({ ...w, speed: v }))} />
        </div>
      </section>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-bold text-ink-900" aria-live="polite">
              {loading && !result ? "Ranking hospitals…" : `${matches.length} hospital${matches.length === 1 ? "" : "s"} for ${treatment?.name || "your treatment"}`}
            </p>
            <p className="text-sm text-ink-500">{destination === "any" ? "Across every destination" : `In ${destination}`} · updates as you change your needs</p>
          </div>
          {compare.ids.length >= 2 && (
            <Link href={`/hospitals/compare?ids=${compare.ids.join(",")}`} className={buttonClass({ variant: "dark", size: "sm" })}>
              <Scale size={15} aria-hidden /> Compare {compare.ids.length}
            </Link>
          )}
        </div>

        <details className="group mb-5 rounded-2xl border border-line bg-white px-5 py-3.5 text-sm text-ink-600">
          <summary className="cursor-pointer list-none font-semibold text-ink-800 marker:hidden">
            <span className="inline-flex items-center gap-2">
              <Info size={15} className="text-brand-600" aria-hidden /> How the ranking works
            </span>
          </summary>
          <p className="mt-2 leading-relaxed">
            Every hospital that offers the treatment starts level. Points are added or taken away for fit with your budget, your destination, published patient ratings, JCI accreditation, your language and how quickly the hospital replies — weighted by the priorities you set. Each chip on a card is a reason it moved up or down. The ranking uses only these factors; payments from hospitals don&rsquo;t change it.
          </p>
        </details>

        <div className={cn("transition-opacity", loading && result && "opacity-60")}>
          {result?.error ? (
            <EmptyState icon={SearchX} title="Couldn't rank hospitals">
              {result.error}
            </EmptyState>
          ) : !result ? (
            <div className="space-y-4">
              {[0, 1, 2].map((k) => (
                <div key={k} className="skeleton h-48 rounded-3xl" />
              ))}
            </div>
          ) : matches.length ? (
            <ul className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {matches.map((m, i) => (
                  <MatchCard key={m.hospital.slug} m={m} rank={i + 1} treatment={treatment} compare={compare} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No verified hospitals match yet"
              action={
                <Link href={`/get-quote?treatment=${treatmentSlug}${destination !== "any" ? `&destination=${encodeURIComponent(destination)}` : ""}`} className={buttonClass({})}>
                  Ask our team to find one
                </Link>
              }
            >
              Try another destination, a lower rating filter or any language — or send your case and a coordinator will look beyond the listed hospitals.
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
