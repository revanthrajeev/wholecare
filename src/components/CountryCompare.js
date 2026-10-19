"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { Select, Button, cn } from "@/components/ui/core";
import { PriceRange } from "@/components/ui/client";
import { TREATMENTS, PRICE_DISCLAIMER } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";

const ORIGIN_CITIES = ["London", "Dubai", "New York", "Lagos", "Nairobi", "Riyadh", "Sydney", "Toronto", "Los Angeles", "Jakarta", "Houston"];

const OPTIONS = TREATMENTS.filter((t) => !t.priceOnAssessment);

export default function CountryCompare({ initialTreatment, initialCountries, hospitalCounts }) {
  const [slug, setSlug] = useState(OPTIONS.some((t) => t.slug === initialTreatment) ? initialTreatment : "total-knee-replacement");
  const t = OPTIONS.find((x) => x.slug === slug);
  const available = useMemo(() => DESTINATIONS.filter((d) => t.prices[d.country]), [t]);
  const [picked, setPicked] = useState(() => {
    const init = (initialCountries || []).filter((c) => DESTINATIONS.some((d) => d.slug === c));
    return init.length ? init : DESTINATIONS.slice(0, 4).map((d) => d.slug);
  });
  const [origin, setOrigin] = useState("London");

  const chosen = useMemo(() => available.filter((d) => picked.includes(d.slug)).slice(0, 4), [available, picked]);
  const chartTreatment = useMemo(() => ({ ...t, prices: Object.fromEntries(Object.entries(t.prices).filter(([c]) => chosen.some((d) => d.country === c))) }), [t, chosen]);
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : p.length >= 4 ? p : [...p, s]));

  const rows = [
    ["Indicative price", (d) => <PriceRange low={t.prices[d.country][0]} high={t.prices[d.country][1]} />],
    ["Hospital stay", () => t.hospitalStay],
    ["Plan to stay in-country", () => t.inCountry],
    [`Flight from ${origin}`, (d) => d.flightTimes.find((f) => f.from === origin)?.hours || "Ask us — usually 1 stop"],
    ["Visa", (d) => d.visa.type],
    ["Accreditation bodies", (d) => d.accreditation.join(", ")],
    [`A strength for ${t.specialty.toLowerCase()}?`, (d) => (d.strengths.includes(t.specialty) ? <Check size={18} className="text-ok-600" aria-label="Yes" /> : <X size={18} className="text-ink-300" aria-label="Not a headline strength" />)],
    ["Language", (d) => d.languages],
    ["Best time to travel", (d) => d.bestTime],
    ["Verified hospitals", (d) => hospitalCounts[d.country] || 0],
  ];

  return (
    <div className="space-y-8">
      <div className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_1fr]">
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">Treatment</span>
          <Select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {OPTIONS.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </Select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-ink-700">Travelling from</span>
          <Select value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {ORIGIN_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </label>
        <div className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-ink-700">Countries (up to 4)</span>
          <div className="flex flex-wrap gap-2">
            {DESTINATIONS.map((d) => {
              const has = Boolean(t.prices[d.country]);
              const on = picked.includes(d.slug) && has;
              return (
                <button
                  key={d.slug}
                  disabled={!has || (!on && chosen.length >= 4)}
                  onClick={() => toggle(d.slug)}
                  aria-pressed={on}
                  title={has ? undefined : `${t.name} isn't priced for ${d.country}`}
                  className={cn("rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-40", on ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}
                >
                  {d.country}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {chosen.length === 0 ? (
        <p className="text-ink-500">Pick at least one country offering {t.name}.</p>
      ) : (
        <>
          <div className="card p-6">
            <h2 className="mb-5 text-lg font-bold text-ink-900">{t.name}: price ranges</h2>
            <PriceChart treatment={chartTreatment} compact />
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="w-56 p-5 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">Compare</th>
                  {chosen.map((d) => (
                    <th key={d.slug} className="p-5 text-left">
                      <Link href={`/countries/${d.slug}`} className="font-display text-lg font-bold text-ink-900 hover:text-brand-700">
                        {d.country}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, fn]) => (
                  <tr key={label} className="border-b border-line last:border-0">
                    <th scope="row" className="bg-ink-50/60 p-4 text-left font-semibold text-ink-600">
                      {label}
                    </th>
                    {chosen.map((d) => (
                      <td key={d.slug} className="p-4 align-top text-ink-800">
                        {fn(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-xs text-ink-400">{PRICE_DISCLAIMER} Flight times are approximate fastest options.</p>
            <Button href={`/get-quote?treatment=${t.slug}`} className="h-auto min-h-11 whitespace-normal py-2.5 text-center">
              Get exact quotes for {t.name.replace(/\s*\(.*\)/, "")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
