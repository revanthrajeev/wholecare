"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Scale, X, SlidersHorizontal } from "lucide-react";
import { HospitalCard } from "@/components/cards";
import { EmptyState, Select, buttonClass, cn } from "@/components/ui/core";
import { SPECIALTIES } from "@/content/specialties";

const STORE = "wc-compare-hospitals";
const CHANGE = "wc-compare-change";
let memory = null; // falls back to in-memory when storage is blocked

function readCompare() {
  if (memory == null) {
    try {
      memory = localStorage.getItem(STORE) || "[]";
    } catch {
      memory = "[]";
    }
  }
  return memory;
}

function subscribeCompare(onChange) {
  const onStorage = (e) => {
    if (e.key !== STORE) return;
    memory = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE, onChange);
  };
}

// Shared across every component on the page (and other tabs) via one external store.
export function useCompareList() {
  const raw = useSyncExternalStore(subscribeCompare, readCompare, () => "[]");
  const ids = useMemo(() => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [raw]);
  const save = (next) => {
    memory = JSON.stringify(next);
    try {
      localStorage.setItem(STORE, memory);
    } catch {}
    window.dispatchEvent(new Event(CHANGE));
  };
  return {
    ids,
    toggle: (slug) => save(ids.includes(slug) ? ids.filter((x) => x !== slug) : ids.length >= 3 ? ids : [...ids, slug]),
    clear: () => save([]),
  };
}

export default function HospitalsBrowser({ hospitals, initial = {} }) {
  const [q, setQ] = useState(initial.q || "");
  const [country, setCountry] = useState(initial.country || "");
  const [specialty, setSpecialty] = useState(initial.specialty || "");
  const [accr, setAccr] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const compare = useCompareList();

  const countries = useMemo(() => [...new Set(hospitals.map((h) => h.country))].sort(), [hospitals]);
  const languages = useMemo(() => [...new Set(hospitals.flatMap((h) => h.languages))].sort(), [hospitals]);
  const specialties = SPECIALTIES.filter((s) => hospitals.some((h) => h.specialties.includes(s.name)));

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const out = hospitals.filter(
      (h) =>
        (!t || `${h.name} ${h.city} ${h.country} ${h.specialties.join(" ")}`.toLowerCase().includes(t)) &&
        (!country || h.country === country) &&
        (!specialty || h.specialties.includes(specialty)) &&
        (!accr || (accr === "JCI" ? h.accreditations.includes("JCI") : h.accreditations.some((a) => a !== "JCI"))) &&
        (!language || h.languages.includes(language))
    );
    return out.sort((a, b) =>
      sort === "rating" ? (b.rating || 0) - (a.rating || 0) || b.reviewCount - a.reviewCount : sort === "response" ? (a.responseHours || 99) - (b.responseHours || 99) : a.name.localeCompare(b.name)
    );
  }, [hospitals, q, country, specialty, accr, language, sort]);

  const active = [country, specialty, accr, language].filter(Boolean).length;
  const reset = () => {
    setCountry("");
    setSpecialty("");
    setAccr("");
    setLanguage("");
    setQ("");
  };

  const selected = compare.ids.map((id) => hospitals.find((h) => h.slug === id)).filter(Boolean);

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search hospitals</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hospital, city or specialty" className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[15px] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
          </label>
          <div className="flex gap-3">
            <Select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className="h-12 py-0 md:w-48">
              <option value="rating">Top rated</option>
              <option value="response">Fastest replies</option>
              <option value="name">Name A–Z</option>
            </Select>
            <button onClick={() => setShowFilters((s) => !s)} className={cn(buttonClass({ variant: "outline", className: "h-12 rounded-xl md:hidden" }))} aria-expanded={showFilters}>
              <SlidersHorizontal size={16} aria-hidden /> Filters{active ? ` (${active})` : ""}
            </button>
          </div>
        </div>
        <div className={cn("mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", showFilters ? "grid" : "hidden md:grid")}>
          <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select aria-label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select aria-label="Accreditation" value={accr} onChange={(e) => setAccr(e.target.value)}>
            <option value="">Any accreditation</option>
            <option value="JCI">JCI (international)</option>
            <option value="national">National accreditation</option>
          </Select>
          <Select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">Any language</option>
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-ink-500">
        <p>
          {list.length} verified {list.length === 1 ? "hospital" : "hospitals"}
        </p>
        {(active > 0 || q) && (
          <button onClick={reset} className="font-semibold text-brand-700 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((h, i) => {
          const on = compare.ids.includes(h.slug);
          const full = compare.ids.length >= 3 && !on;
          return (
            <HospitalCard
              key={h.id}
              hospital={h}
              priority={i < 3}
              footer={
                <div className="flex items-center justify-between">
                  <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm font-medium", full ? "text-ink-300" : "text-ink-600")}>
                    <input type="checkbox" checked={on} disabled={full} onChange={() => compare.toggle(h.slug)} className="h-4 w-4 accent-brand-700" />
                    Compare
                  </label>
                  <Link href={`/get-quote?hospital=${h.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Request quote
                  </Link>
                </div>
              }
            />
          );
        })}
      </div>
      {list.length === 0 && (
        <EmptyState icon={Search} title="No hospitals match these filters" action={<button onClick={reset} className={buttonClass({ variant: "outline" })}>Clear filters</button>}>
          Try another country or specialty — or ask us to find options for you.
        </EmptyState>
      )}

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-0 bottom-4 z-40 px-4">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-3xl bg-ink-900 p-3 pl-5 text-white shadow-lift">
              <Scale size={18} className="text-glow" aria-hidden />
              <div className="flex flex-1 flex-wrap gap-2">
                {selected.map((h) => (
                  <span key={h.slug} className="inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1.5 text-xs">
                    {h.name}
                    <button onClick={() => compare.toggle(h.slug)} aria-label={`Remove ${h.name}`} className="rounded-full p-0.5 hover:bg-white/20">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selected.length < 3 && <span className="py-1 text-xs text-ink-300">Pick up to {3 - selected.length} more</span>}
              </div>
              <Link href={`/hospitals/compare?ids=${compare.ids.join(",")}`} className={buttonClass({ variant: "accent", size: "sm", className: selected.length < 2 ? "pointer-events-none opacity-50" : "" })} aria-disabled={selected.length < 2}>
                Compare {selected.length}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
