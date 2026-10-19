"use client";
import { useMemo, useState } from "react";
import { formatDate } from "@/components/ui/core";

const PAIN = "#E8713C";
const MOBILITY = "#0E8F82";
const W = 640;
const H = 240;
const P = { l: 30, r: 92, t: 16, b: 30 };

export default function RecoveryChart({ checkins }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  const pts = useMemo(() => {
    if (!checkins.length) return [];
    const times = checkins.map((c) => Date.parse(`${c.date}T12:00:00Z`));
    const t0 = Math.min(...times);
    const t1 = Math.max(...times);
    const span = Math.max(1, t1 - t0);
    return checkins.map((c, i) => ({
      ...c,
      x: checkins.length === 1 ? P.l + (W - P.l - P.r) / 2 : P.l + ((times[i] - t0) / span) * (W - P.l - P.r),
      yPain: P.t + (1 - c.pain / 10) * (H - P.t - P.b),
      yMob: P.t + (1 - c.mobility / 10) * (H - P.t - P.b),
    }));
  }, [checkins]);

  if (!pts.length) return <p className="py-10 text-center text-sm text-ink-400">Your first check-in will start the chart.</p>;
  const path = (key) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p[key].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const h = hover != null ? pts[hover] : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-600">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded-full" style={{ background: PAIN }} aria-hidden /> Pain (0 = none)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded-full" style={{ background: MOBILITY }} aria-hidden /> Mobility (10 = normal)
          </span>
        </div>
        <button onClick={() => setTable((t) => !t)} className="rounded-full border border-line px-3 py-1 font-medium hover:border-ink-300">
          {table ? "Chart view" : "Table view"}
        </button>
      </div>
      {table ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Pain</th>
                <th className="px-4 py-2.5 font-semibold">Mobility</th>
                <th className="px-4 py-2.5 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c) => (
                <tr key={c.date} className="border-t border-line">
                  <td className="px-4 py-2 tabular-nums">{formatDate(c.date)}</td>
                  <td className="px-4 py-2 tabular-nums">{c.pain}/10</td>
                  <td className="px-4 py-2 tabular-nums">{c.mobility}/10</td>
                  <td className="px-4 py-2 text-ink-500">{c.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Recovery trend: pain ${pts[0].pain} to ${last.pain}, mobility ${pts[0].mobility} to ${last.mobility} out of 10`} onMouseLeave={() => setHover(null)}>
            {[0, 5, 10].map((v) => {
              const y = P.t + (1 - v / 10) * (H - P.t - P.b);
              return (
                <g key={v}>
                  <line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="#E9EEF4" strokeWidth="1" />
                  <text x={P.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#8496AD">
                    {v}
                  </text>
                </g>
              );
            })}
            {h && <line x1={h.x} x2={h.x} y1={P.t} y2={H - P.b} stroke="#B6C3D3" strokeWidth="1" />}
            <path d={path("yMob")} fill="none" stroke={MOBILITY} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <path d={path("yPain")} fill="none" stroke={PAIN} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <g key={p.date}>
                <circle cx={p.x} cy={p.yMob} r={hover === i ? 5 : 4} fill={MOBILITY} stroke="#fff" strokeWidth="2" />
                <circle cx={p.x} cy={p.yPain} r={hover === i ? 5 : 4} fill={PAIN} stroke="#fff" strokeWidth="2" />
              </g>
            ))}
            <text x={last.x + 10} y={last.yPain + 4} fontSize="12" fill="#3B5677" fontWeight="600">
              Pain {last.pain}
            </text>
            <text x={last.x + 10} y={last.yMob + (Math.abs(last.yMob - last.yPain) < 14 ? (last.yMob < last.yPain ? -8 : 16) : 4)} fontSize="12" fill="#3B5677" fontWeight="600">
              Mobility {last.mobility}
            </text>
            <text x={P.l} y={H - 8} fontSize="11" fill="#8496AD">
              {formatDate(pts[0].date, { day: "numeric", month: "short" })}
            </text>
            {pts.length > 1 && (
              <text x={W - P.r} y={H - 8} fontSize="11" fill="#8496AD" textAnchor="end">
                {formatDate(last.date, { day: "numeric", month: "short" })}
              </text>
            )}
            {pts.map((p, i) => {
              const prev = pts[i - 1]?.x ?? P.l;
              const next = pts[i + 1]?.x ?? W - P.r;
              const x0 = i === 0 ? P.l - 10 : (prev + p.x) / 2;
              const x1 = i === pts.length - 1 ? W - P.r + 10 : (p.x + next) / 2;
              return (
                <rect
                  key={`hit-${p.date}`}
                  x={x0}
                  y={0}
                  width={Math.max(24, x1 - x0)}
                  height={H}
                  fill="transparent"
                  tabIndex={0}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${formatDate(p.date)}: pain ${p.pain}, mobility ${p.mobility}`}
                />
              );
            })}
          </svg>
          {h && (
            <div className="pointer-events-none absolute top-0 z-10 rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-lift" style={{ left: `min(calc(${(h.x / W) * 100}% + 12px), calc(100% - 180px))` }}>
              <p className="font-semibold">{formatDate(h.date, { weekday: "short", day: "numeric", month: "short" })}</p>
              <p>
                Pain {h.pain}/10 · Mobility {h.mobility}/10
              </p>
              {h.note && <p className="mt-1 max-w-[160px] text-ink-300">{h.note}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
