"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TreatmentCard } from "@/components/cards";
import { EmptyState, cn } from "@/components/ui/core";
import { TREATMENTS } from "@/content/treatments";
import { SPECIALTIES } from "@/content/specialties";

export default function TreatmentsBrowser({ initialQuery = "", initialSpecialty = "" }) {
  const [q, setQ] = useState(initialQuery);
  const [spec, setSpec] = useState(initialSpecialty);
  const specialtyName = SPECIALTIES.find((s) => s.slug === spec)?.name;
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TREATMENTS.filter((tr) => (!specialtyName || tr.specialty === specialtyName) && (!t || `${tr.name} ${tr.specialty} ${tr.summary}`.toLowerCase().includes(t)));
  }, [q, specialtyName]);
  const counts = useMemo(() => Object.fromEntries(SPECIALTIES.map((s) => [s.slug, TREATMENTS.filter((t) => t.specialty === s.name).length])), []);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-sm">
          <span className="sr-only">Search treatments</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search e.g. knee, IVF, bypass" className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-[15px] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
        </label>
        <p className="text-sm text-ink-500">
          {list.length} of {TREATMENTS.length} treatments
        </p>
      </div>
      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setSpec("")} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition", !spec ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
          All
        </button>
        {SPECIALTIES.filter((s) => counts[s.slug]).map((s) => (
          <button
            key={s.slug}
            onClick={() => setSpec(spec === s.slug ? "" : s.slug)}
            aria-pressed={spec === s.slug}
            className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition", spec === s.slug ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}
          >
            {s.name} <span className="ml-1 opacity-60">{counts[s.slug]}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((t) => (
          <TreatmentCard key={t.slug} treatment={t} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Search} title="No treatments match that search">
            Try a broader term — or ask the assistant, or request a quote and describe what you need.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
