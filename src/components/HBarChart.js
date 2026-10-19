"use client";
import { useState } from "react";
import { cn } from "@/components/ui/core";

// Single-series horizontal bars. Pass `colors` (one per row, ordered) for an ordinal ramp.
export default function HBarChart({ data, valueLabel = "Count", format = (v) => v, colors, emptyText = "No data yet" }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  if (!data.length || data.every((d) => !d.value)) return <p className="py-6 text-center text-sm text-ink-400">{emptyText}</p>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button onClick={() => setTable((t) => !t)} className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-500 hover:border-ink-300">
          {table ? "Chart" : "Table"}
        </button>
      </div>
      {table ? (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-ink-400">
            <tr>
              <th className="py-1.5 font-semibold">Label</th>
              <th className="py-1.5 text-right font-semibold">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-line">
                <td className="py-1.5 text-ink-700">{d.label}</td>
                <td className="py-1.5 text-right tabular-nums text-ink-900">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="space-y-[2px]" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <li key={d.label}>
              <div
                tabIndex={0}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="grid grid-cols-[110px_1fr_48px] items-center gap-3 rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label={`${d.label}: ${format(d.value)}`}
              >
                <span className="truncate text-sm text-ink-700">{d.label}</span>
                <span className="relative h-6">
                  <span
                    className={cn("absolute inset-y-1 left-0 rounded-r-[4px] transition-[filter]", hover != null && hover !== i && "opacity-50")}
                    style={{ width: d.value ? `${Math.max(2, (d.value / max) * 100)}%` : 0, background: colors?.[i] || "#0E8F82" }}
                  />
                  {hover === i && (
                    <span className="absolute -top-8 left-0 z-10 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-xs text-white shadow-lift">
                      {d.label}: {format(d.value)}
                      {d.hint ? ` · ${d.hint}` : ""}
                    </span>
                  )}
                </span>
                <span className="text-right text-sm font-semibold tabular-nums text-ink-900">{format(d.value)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Validated ordinal ramps (light surface): 5 and 6 steps.
export const ORDINAL_TEAL = ["#5BBDAF", "#2A9E8F", "#117F73", "#0B635A", "#084842"];
export const ORDINAL_TEAL_6 = ["#66C2B5", "#3AAA9B", "#1B8F81", "#0F7268", "#0A5A52", "#07423C"];
