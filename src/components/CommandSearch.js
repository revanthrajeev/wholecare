"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, Stethoscope, Building2, UserRound, Globe2, BookOpen, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/components/ui/core";

const ICONS = { Treatment: Stethoscope, Hospital: Building2, Doctor: UserRound, Destination: Globe2, Guide: BookOpen, Specialty: Layers, Page: ArrowRight };
const ORDER = ["Page", "Treatment", "Specialty", "Hospital", "Doctor", "Destination", "Guide"];
const POPULAR = ["/get-quote", "/treatments/total-knee-replacement", "/treatments/coronary-bypass-cabg", "/treatments/ivf", "/second-opinion", "/countries/compare", "/treatments/hair-transplant"];

function score(item, tokens) {
  const title = item.title.toLowerCase();
  const hay = `${title} ${(item.subtitle || "").toLowerCase()} ${(item.keywords || "").toLowerCase()}`;
  let s = 0;
  for (const t of tokens) {
    if (!hay.includes(t)) return -1;
    s += title.startsWith(t) ? 6 : title.includes(t) ? 3 : 1;
  }
  return s + (item.type === "Page" ? 0.5 : 0);
}

export default function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(null);
  const [active, setActive] = useState(0);
  const input = useRef(null);
  const list = useRef(null);

  useEffect(() => {
    // Every open starts from a clean search.
    const show = () => {
      setQuery("");
      setActive(0);
      setOpen(true);
    };
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wc:open-search", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wc:open-search", show);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!items) fetch("/api/search-index").then((r) => r.json()).then(setItems).catch(() => setItems([]));
    setTimeout(() => input.current?.focus(), 30);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, items]);

  const results = useMemo(() => {
    if (!items) return [];
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return POPULAR.map((href) => items.find((i) => i.href === href)).filter(Boolean);
    return items
      .map((i) => ({ i, s: score(i, tokens) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || ORDER.indexOf(a.i.type) - ORDER.indexOf(b.i.type))
      .slice(0, 24)
      .map((x) => x.i);
  }, [items, query]);


  function go(item) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  useEffect(() => {
    list.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search Whole Care"
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search size={18} className="text-ink-400" aria-hidden />
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search treatments, hospitals, doctors, destinations…"
                aria-label="Search"
                className="h-16 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <kbd className="rounded-md bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-500">Esc</kbd>
            </div>
            <div ref={list} className="max-h-[56vh] overflow-y-auto p-2">
              {!items ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="skeleton h-12 rounded-xl" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-ink-500">
                  No matches for &ldquo;{query}&rdquo;. Try a procedure (e.g. &ldquo;knee&rdquo;), a country, or a city.
                </p>
              ) : (
                <>
                  {!query && <p className="eyebrow px-3 pb-1 pt-2 text-ink-400">Popular</p>}
                  {results.map((r, idx) => {
                    const Icon = ICONS[r.type] || ArrowRight;
                    return (
                      <button
                        key={`${r.type}-${r.href}`}
                        data-idx={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(r)}
                        className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition", idx === active ? "bg-brand-50" : "hover:bg-ink-50")}
                      >
                        <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", idx === active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600")}>
                          <Icon size={16} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink-900">{r.title}</span>
                          {r.subtitle && <span className="block truncate text-xs text-ink-500">{r.subtitle}</span>}
                        </span>
                        <span className="text-[11px] font-medium text-ink-400">{r.type}</span>
                        {idx === active && <CornerDownLeft size={14} className="text-brand-700" aria-hidden />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
