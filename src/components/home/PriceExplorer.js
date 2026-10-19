"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BedDouble, CalendarDays, TrendingDown } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { PriceRange } from "@/components/ui/client";
import { buttonClass, cn } from "@/components/ui/core";
import { TREATMENTS, PRICE_DISCLAIMER, priceSummary } from "@/content/treatments";

const FEATURED = ["total-knee-replacement", "coronary-bypass-cabg", "ivf", "gastric-sleeve", "hair-transplant", "dental-implant", "spinal-fusion", "cataract-surgery"];

export default function PriceExplorer() {
  const [slug, setSlug] = useState(FEATURED[0]);
  const t = TREATMENTS.find((x) => x.slug === slug);
  const s = priceSummary(t);
  const options = TREATMENTS.filter((x) => !x.priceOnAssessment);

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-line bg-ink-50/60 p-4 sm:p-5">
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          {FEATURED.map((f) => {
            const tr = TREATMENTS.find((x) => x.slug === f);
            return (
              <button
                key={f}
                onClick={() => setSlug(f)}
                aria-pressed={slug === f}
                className={cn("whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition", slug === f ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}
              >
                {tr.name.replace(/\s*\(.*\)/, "")}
              </button>
            );
          })}
          <label className="sr-only" htmlFor="pe-all">
            All treatments
          </label>
          <select
            id="pe-all"
            value={FEATURED.includes(slug) ? "" : slug}
            onChange={(e) => e.target.value && setSlug(e.target.value)}
            className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink-600 ring-1 ring-line"
          >
            <option value="">More…</option>
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
          <div>
            <h3 className="text-xl font-bold text-ink-900">{t.name}</h3>
            <p className="mt-1 text-sm text-ink-500">{t.summary}</p>
            <div className="mt-6">
              <PriceChart treatment={t} />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-ink-900 p-5 text-white">
              <p className="text-xs text-ink-300">Lowest typical range · {s.cheapestCountry}</p>
              <p className="mt-1 font-display text-3xl font-bold">
                <PriceRange low={s.cheapestRange[0]} high={s.cheapestRange[1]} />
              </p>
              {s.usRange && (
                <p className="mt-3 text-sm leading-relaxed text-ink-200">
                  <TrendingDown size={16} className="mr-1.5 inline text-glow" aria-hidden />
                  Typically ~{s.savingPct}% below US prices of <span className="whitespace-nowrap font-semibold text-white"><PriceRange low={s.usRange[0]} high={s.usRange[1]} /></span>
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line p-4">
                <BedDouble size={16} className="text-brand-700" aria-hidden />
                <p className="mt-2 text-xs text-ink-500">Hospital stay</p>
                <p className="text-sm font-semibold text-ink-900">{t.hospitalStay}</p>
              </div>
              <div className="rounded-2xl border border-line p-4">
                <CalendarDays size={16} className="text-brand-700" aria-hidden />
                <p className="mt-2 text-xs text-ink-500">Time in country</p>
                <p className="text-sm font-semibold text-ink-900">{t.inCountry}</p>
              </div>
            </div>
            <Link href={`/get-quote?treatment=${t.slug}`} className={buttonClass({ size: "md", className: "w-full" })}>
              Get exact quotes <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href={`/treatments/${t.slug}`} className="text-center text-sm font-semibold text-brand-700 hover:underline">
              Full {t.name.replace(/\s*\(.*\)/, "").toLowerCase()} guide
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="border-t border-line bg-ink-50/60 px-5 py-3 text-xs text-ink-500 sm:px-7">{PRICE_DISCLAIMER}</p>
    </div>
  );
}
