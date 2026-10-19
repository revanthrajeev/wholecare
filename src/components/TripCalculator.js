"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, useReducedMotion } from "framer-motion";
import { Plane, BedDouble, Utensils, Stamp, ShieldPlus, Stethoscope, Minus, Plus, ArrowRight, CheckCircle2, XCircle, Home, Info, Clock } from "lucide-react";
import { TREATMENTS, PRICE_DISCLAIMER, treatmentBySlug } from "@/content/treatments";
import { DESTINATIONS, ORIGINS, STAY_COSTS } from "@/content/destinations";
import { HOTEL_TIERS, estimateFlightUSD, suggestedNights, tripCost } from "@/lib/trip";
import { CURRENCIES, formatMoney, formatRange } from "@/lib/currency";
import { useCurrency, CurrencySelect } from "@/components/ui/client";
import { Badge, Field, Input, Select, buttonClass, cn } from "@/components/ui/core";

const PRICED = TREATMENTS.filter((t) => !t.priceOnAssessment);
const SPECIALTY_GROUPS = [...new Set(PRICED.map((t) => t.specialty))].map((s) => [s, PRICED.filter((t) => t.specialty === s)]);
const OTHER = "__other";

const countriesFor = (t) => DESTINATIONS.map((d) => d.country).filter((c) => t.prices[c]);
const cheapest = (t) => countriesFor(t).sort((a, b) => t.prices[a][0] - t.prices[b][0])[0];
const mid = ([a, b]) => (a + b) / 2;

// Tweens between values so totals glide instead of jumping when inputs change.
function AnimatedMoney({ usd, currency }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(usd);
  const from = useRef(usd);
  useEffect(() => {
    if (reduce) return;
    const ctl = animate(from.current, usd, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => {
        from.current = x;
        setShown(x);
      },
    });
    return () => ctl.stop();
  }, [usd, reduce]);
  return formatMoney(reduce ? usd : shown, currency);
}

function Stepper({ value, onChange, min, max, label }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:opacity-40">
        <Minus size={16} aria-hidden />
      </button>
      <span className="w-8 text-center font-semibold tabular-nums text-ink-900" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-50 disabled:opacity-40">
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}

function Breakdown({ rows, currency }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1" onMouseLeave={() => setHover(null)}>
      {rows.map((r, i) => {
        const Icon = r.icon;
        return (
          <li
            key={r.label}
            tabIndex={0}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 outline-none transition hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-brand-500 sm:grid-cols-[minmax(0,170px)_1fr_auto]"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink-700">
              <Icon size={16} className="shrink-0 text-ink-400" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate">{r.label}</span>
                <span className="block text-[11px] leading-snug text-ink-400 sm:hidden">{r.how}</span>
              </span>
            </span>
            <span className="relative col-span-2 h-3 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-5">
              <span className={cn("absolute inset-y-0.5 left-0 rounded-r-[4px] bg-brand-600 transition-all duration-500 sm:inset-y-1", hover != null && hover !== i && "opacity-40")} style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%` }} />
              {hover === i && <span className="absolute -top-8 left-0 z-10 hidden whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-xs text-white shadow-lift sm:block">{r.how}</span>}
            </span>
            <span className="col-start-2 row-start-1 text-right text-sm font-semibold tabular-nums text-ink-900 sm:col-start-3">{r.display || formatMoney(r.value, currency)}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function TripCalculator({ initialTreatment, initialDestination }) {
  const { currency } = useCurrency();
  const rate = CURRENCIES[currency]?.rate || 1;
  const start = treatmentBySlug(initialTreatment) || treatmentBySlug("total-knee-replacement");
  const [slug, setSlug] = useState(start.slug);
  const [country, setCountry] = useState(initialDestination && start.prices[initialDestination] ? initialDestination : cheapest(start));
  const [origin, setOrigin] = useState("London");
  const [customFare, setCustomFare] = useState(null);
  const [travellers, setTravellers] = useState(2);
  const [nights, setNights] = useState(suggestedNights(start.inCountry));
  const [tier, setTier] = useState(1);
  const [buffer, setBuffer] = useState(true);

  const t = treatmentBySlug(slug);
  const available = countriesFor(t);
  const destination = DESTINATIONS.find((d) => d.country === country);

  function chooseTreatment(next) {
    const nt = treatmentBySlug(next);
    setSlug(next);
    setNights(suggestedNights(nt.inCountry));
    if (!nt.prices[country]) setCountry(cheapest(nt));
  }

  const fareFor = (c) => (customFare != null && (origin === OTHER || c === country) ? customFare : estimateFlightUSD(origin, c) ?? 0);
  const params = { treatment: t, travellers, nights, tier, buffer };
  const trip = tripCost({ ...params, country, flightUSD: fareFor(country) });
  const fare = fareFor(country);
  const flightTime = destination?.flightTimes.find((f) => f.from === origin)?.hours;

  const compare = available
    .map((c) => ({ country: c, fare: fareFor(c), trip: tripCost({ ...params, country: c, flightUSD: fareFor(c) }), time: DESTINATIONS.find((d) => d.country === c)?.flightTimes.find((f) => f.from === origin)?.hours }))
    .filter((x) => x.trip)
    .sort((a, b) => mid(a.trip.total) - mid(b.trip.total));
  const maxCompare = Math.max(...compare.map((x) => mid(x.trip.total)), 1);

  const stay = STAY_COSTS[country];
  const rows = [
    { label: "Treatment", icon: Stethoscope, value: mid(trip.treatment), display: formatRange(trip.treatment[0], trip.treatment[1], currency), how: `Typical range in ${country}` },
    { label: "Flights", icon: Plane, value: trip.lines.flights, how: `${travellers} × ${formatMoney(fare, currency)} return` },
    { label: "Accommodation", icon: BedDouble, value: trip.lines.hotel, how: `${nights} nights × ${trip.rooms} room${trip.rooms > 1 ? "s" : ""} × ${formatMoney(stay.hotel[tier], currency)}` },
    { label: "Food & local travel", icon: Utensils, value: trip.lines.living, how: `${nights} days · meals ${formatMoney(stay.meals, currency)}/person + transport ${formatMoney(stay.transport, currency)}/day` },
    { label: "Visa", icon: Stamp, value: trip.lines.visa, how: `${travellers} × ~${formatMoney(stay.visa, currency)} · many passports pay less` },
    ...(buffer ? [{ label: "Safety buffer", icon: ShieldPlus, value: mid(trip.buffer), display: formatRange(trip.buffer[0], trip.buffer[1], currency), how: "10% of treatment for extra nights or tests" }] : []),
  ];
  const homes = Object.entries(t.home || {}).map(([place, range]) => ({ place, range, saving: Math.round((1 - mid(trip.total) / mid(range)) * 100) }));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      {/* ---------- Inputs ---------- */}
      <section className="card space-y-6 p-6 lg:sticky lg:top-24" aria-label="Trip details">
        <Field label="Treatment" htmlFor="calc-treatment">
          <Select id="calc-treatment" value={slug} onChange={(e) => chooseTreatment(e.target.value)}>
            {SPECIALTY_GROUPS.map(([s, list]) => (
              <optgroup key={s} label={s}>
                {list.map((x) => (
                  <option key={x.slug} value={x.slug}>
                    {x.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-700">Destination</legend>
          <div className="grid grid-cols-2 gap-2">
            {available.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                aria-pressed={country === c}
                className={cn("rounded-2xl border px-3 py-2.5 text-left transition", country === c ? "border-brand-600 bg-brand-50 ring-2 ring-brand-500/20" : "border-line bg-white hover:border-ink-300")}
              >
                <span className="block text-sm font-semibold text-ink-900">{c}</span>
                <span className="block text-xs text-ink-500">from {formatMoney(t.prices[c][0], currency)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <Field label="Flying from" htmlFor="calc-origin" hint={origin !== OTHER && customFare == null ? `≈${formatMoney(fare, currency)} return each` : undefined}>
          <Select
            id="calc-origin"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setCustomFare(e.target.value === OTHER ? 700 : null);
            }}
          >
            {ORIGINS.map((o) => (
              <option key={o.city} value={o.city}>
                {o.city}
              </option>
            ))}
            <option value={OTHER}>Somewhere else</option>
          </Select>
        </Field>
        <div className="-mt-3">
          {customFare == null ? (
            <button type="button" onClick={() => setCustomFare(fare)} className="text-xs font-semibold text-brand-700 hover:underline">
              I know my fare — edit it
            </button>
          ) : (
            <Field label={`Return fare per person (${currency})`} htmlFor="calc-fare">
              <Input id="calc-fare" type="number" min="0" step="10" value={Math.round(customFare * rate)} onChange={(e) => setCustomFare(Math.max(0, Number(e.target.value) || 0) / rate)} />
            </Field>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink-700">Travellers</p>
            <p className="text-xs text-ink-400">You plus companions</p>
          </div>
          <Stepper value={travellers} onChange={setTravellers} min={1} max={5} label="travellers" />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <label htmlFor="calc-nights" className="text-sm font-semibold text-ink-700">
              Nights in {country}
            </label>
            <span className="font-semibold tabular-nums text-ink-900">{nights}</span>
          </div>
          <input id="calc-nights" type="range" min="2" max="120" value={nights} onChange={(e) => setNights(Number(e.target.value))} className="w-full accent-brand-600" />
          <p className="mt-1 text-xs text-ink-400">Usually {t.inCountry} in country for this procedure.</p>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-700">Accommodation</legend>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-100/70 p-1">
            {HOTEL_TIERS.map((label, i) => (
              <button key={label} type="button" onClick={() => setTier(i)} aria-pressed={tier === i} className={cn("rounded-xl px-2 py-2 text-center transition", tier === i ? "bg-white shadow-soft" : "hover:bg-white/60")}>
                <span className="block text-sm font-semibold text-ink-900">{label}</span>
                <span className="block text-[11px] text-ink-500">{formatMoney(stay.hotel[i], currency)}/night</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-3">
          <input type="checkbox" checked={buffer} onChange={(e) => setBuffer(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
          <span className="text-sm">
            <span className="font-semibold text-ink-900">Add a 10% safety buffer</span>
            <span className="block text-xs text-ink-500">For an extra night in hospital, more tests or a changed flight.</span>
          </span>
        </label>
      </section>

      {/* ---------- Results ---------- */}
      <div className="min-w-0 space-y-6">
        <section className="hero-night relative overflow-hidden rounded-[28px] p-7 text-white md:p-9" aria-live="polite">
          <div aria-hidden className="grid-fade pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow text-glow">Estimated total · {t.name} in {country}</p>
              <CurrencySelect dark />
            </div>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums md:text-6xl">
              <AnimatedMoney usd={trip.total[0]} currency={currency} />
              <span className="text-white/40"> – </span>
              <AnimatedMoney usd={trip.total[1]} currency={currency} />
            </p>
            <p className="mt-2 text-sm text-ink-300">
              For {travellers} traveller{travellers > 1 ? "s" : ""}, {nights} nights, {HOTEL_TIERS[tier].toLowerCase()} stay{flightTime ? ` · ${flightTime} flight from ${origin}` : ""}
            </p>
            {homes.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {homes.map((h) => (
                  <div key={h.place} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="flex items-center gap-1.5 text-xs text-ink-300">
                      <Home size={13} aria-hidden /> Self-pay in the {h.place === "United States" ? "US" : h.place === "United Kingdom" ? "UK" : h.place}
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">{formatRange(h.range[0], h.range[1], currency)}</p>
                    <p className={cn("mt-1 text-sm font-semibold", h.saving > 0 ? "text-glow" : "text-sun-400")}>{h.saving > 0 ? `Whole trip ≈ ${h.saving}% less` : "Similar or more than at home — waiting time may still matter"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-bold text-ink-900">Where the money goes</p>
            <p className="hidden text-xs text-ink-400 sm:block">Hover a row to see the maths</p>
          </div>
          <div className="mt-4">
            <Breakdown rows={rows} currency={currency} />
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="p-6 pb-3">
            <p className="font-bold text-ink-900">Same trip, every destination</p>
            <p className="text-xs text-ink-400">Same travellers, nights and hotel tier · tap a row to switch</p>
          </div>
          <ul className="divide-y divide-line">
            {compare.map((x, i) => (
              <li key={x.country}>
                <button type="button" onClick={() => setCountry(x.country)} aria-pressed={x.country === country} className={cn("grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-6 py-3.5 text-left transition sm:grid-cols-[190px_1fr_auto]", x.country === country ? "bg-brand-50/70" : "hover:bg-ink-50")}>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold text-ink-900">
                      {x.country}
                      {i === 0 && <Badge tone="success">Lowest</Badge>}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      {x.time && (
                        <>
                          <Clock size={11} aria-hidden /> {x.time} ·
                        </>
                      )}{" "}
                      fare ≈{formatMoney(x.fare, currency)}
                    </span>
                  </span>
                  <span className="relative col-span-2 h-2 rounded-full bg-ink-100 sm:col-span-1" aria-hidden>
                    <span className="absolute inset-y-0 left-0 rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${(mid(x.trip.total) / maxCompare) * 100}%` }} />
                  </span>
                  <span className="col-start-2 row-start-1 text-right text-sm font-semibold tabular-nums text-ink-900 sm:col-start-3">{formatRange(x.trip.total[0], x.trip.total[1], currency)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="card p-6">
            <p className="font-bold text-ink-900">Hospital price usually includes</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.includes.map((x) => (
                <li key={x} className="flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ok-600" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6">
            <p className="font-bold text-ink-900">Usually not included</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-700">
              {t.excludes.map((x) => (
                <li key={x} className="flex gap-2">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="flex flex-col gap-5 rounded-[28px] bg-brand-700 p-7 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-bold">Turn this estimate into real quotes</p>
            <p className="mt-1 text-brand-100">Verified hospitals in {country} reply with itemized, price-locked quotes. Free for patients.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/get-quote?treatment=${t.slug}&destination=${encodeURIComponent(country)}`} className={buttonClass({ variant: "accent", size: "lg" })}>
              Get free quotes <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href={`/match?treatment=${t.slug}&destination=${encodeURIComponent(country)}`} className={buttonClass({ variant: "ghostDark", size: "lg" })}>
              Rank hospitals
            </Link>
          </div>
        </section>

        <p className="flex gap-2 text-xs leading-relaxed text-ink-400">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            {PRICE_DISCLAIMER} Travel figures are planning estimates: return economy fares are estimated from distance to {destination?.hub.city}, and hotel, food and visa costs use typical late-2026 rates. Currency conversions are indicative. Cancer care is priced after assessment — <Link href="/get-quote?treatment=cancer-treatment-plan" className="underline hover:text-ink-600">request a treatment plan</Link>.
          </span>
        </p>
      </div>
    </div>
  );
}
