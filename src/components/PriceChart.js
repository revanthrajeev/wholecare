"use client";
import { useMemo, useState } from "react";
import { useCurrency } from "@/components/ui/client";
import { formatMoney, formatRange } from "@/lib/currency";
import { cn } from "@/components/ui/core";

const SERIES = "#0E8F82";
const HOME = "#B6C3D3";

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => n <= x);
  return step * p;
}

// Range bars of indicative prices per destination; home-country references are
// optional grey rows so destination bars stay legible on a linear scale.
export default function PriceChart({ treatment, showHomeDefault = false, compact }) {
  const { currency } = useCurrency();
  const [showHome, setShowHome] = useState(showHomeDefault);
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);

  const usMid = treatment.home?.["United States"] ? (treatment.home["United States"][0] + treatment.home["United States"][1]) / 2 : null;
  const rows = useMemo(() => {
    const dest = Object.entries(treatment.prices || {})
      .map(([country, [lo, hi]]) => ({ country, lo, hi, kind: "dest" }))
      .sort((a, b) => a.lo + a.hi - (b.lo + b.hi));
    const home = Object.entries(treatment.home || {}).map(([country, [lo, hi]]) => ({ country, lo, hi, kind: "home" }));
    return { dest, home };
  }, [treatment]);

  const visible = showHome ? [...rows.dest, ...rows.home] : rows.dest;
  const max = niceMax(Math.max(...visible.map((r) => r.hi)) * 1.04);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const saving = (r) => (usMid ? Math.round((1 - (r.lo + r.hi) / 2 / usMid) * 100) : null);

  if (!rows.dest.length) return null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-5 rounded-full" style={{ background: SERIES }} aria-hidden /> Destination range
          </span>
          {showHome && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-full" style={{ background: HOME }} aria-hidden /> Typical price at home
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {rows.home.length > 0 && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 font-medium text-ink-600">
              <input type="checkbox" checked={showHome} onChange={(e) => setShowHome(e.target.checked)} className="accent-brand-700" />
              Compare with US / UK
            </label>
          )}
          <button onClick={() => setTable((t) => !t)} className="rounded-full border border-line bg-white px-3 py-1.5 font-medium text-ink-600 hover:border-ink-300">
            {table ? "Chart view" : "Table view"}
          </button>
        </div>
      </div>

      {table ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Country</th>
                <th className="px-4 py-3 font-semibold">Indicative range</th>
                <th className="px-4 py-3 font-semibold">vs. US midpoint</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.country} className="border-t border-line">
                  <td className="px-4 py-2.5 font-medium text-ink-900">{r.country}{r.kind === "home" && <span className="ml-1 text-xs text-ink-400">(home)</span>}</td>
                  <td className="px-4 py-2.5 tabular-nums text-ink-700">{formatRange(r.lo, r.hi, currency)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-ink-700">{r.kind === "dest" && saving(r) != null ? `${saving(r)}% lower` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative" onMouseLeave={() => setHover(null)}>
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[112px] right-[8px] sm:right-[150px]">
              {ticks.map((t, i) => (
                <div key={i} className="absolute inset-y-0 border-l border-ink-100" style={{ left: `${(t / max) * 100}%` }} />
              ))}
            </div>
            <ul className={cn("relative", compact ? "space-y-1" : "space-y-1.5")}>
              {visible.map((r, i) => {
                const left = (r.lo / max) * 100;
                const width = Math.max(1.2, ((r.hi - r.lo) / max) * 100);
                const isHover = hover === r.country;
                const firstHome = r.kind === "home" && visible[i - 1]?.kind === "dest";
                return (
                  <li key={r.country} className={firstHome ? "mt-3 border-t border-dashed border-ink-200 pt-3" : ""}>
                    <div
                      tabIndex={0}
                      onMouseEnter={() => setHover(r.country)}
                      onFocus={() => setHover(r.country)}
                      onBlur={() => setHover(null)}
                      className="group grid cursor-default grid-cols-[104px_1fr] items-center gap-2 rounded-xl py-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:grid-cols-[104px_1fr_142px]"
                    >
                      <span className={cn("truncate pl-1 text-sm", r.kind === "home" ? "text-ink-500" : "font-medium text-ink-800")}>{r.country}</span>
                      <span className="relative h-7">
                        <span
                          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full transition-[filter,height] duration-200"
                          style={{ left: `${left}%`, width: `${width}%`, background: r.kind === "home" ? HOME : SERIES, filter: hover && !isHover ? "saturate(0.4) opacity(0.55)" : "none", height: isHover ? 14 : 12 }}
                        />
                        {isHover && (
                          <span className="absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-lift" style={{ left: `min(${left}%, calc(100% - 180px))` }}>
                            <span className="font-semibold">{r.country}</span> · {formatRange(r.lo, r.hi, currency)}
                            {r.kind === "dest" && saving(r) != null && <span className="text-glow"> · ~{saving(r)}% below US</span>}
                          </span>
                        )}
                      </span>
                      <span className="hidden text-right text-sm tabular-nums text-ink-700 sm:block">{formatRange(r.lo, r.hi, currency)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div aria-hidden className="relative ml-[112px] mr-[8px] mt-2 h-5 text-[11px] tabular-nums text-ink-400 sm:mr-[150px]">
            {ticks.map((t, i) => (
              <span key={i} className="absolute -translate-x-1/2" style={{ left: `${(t / max) * 100}%` }}>
                {t === 0 ? "0" : formatMoney(t, currency)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
