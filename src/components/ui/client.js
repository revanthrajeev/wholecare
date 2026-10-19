"use client";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion, animate } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { CURRENCIES, CURRENCY_COOKIE, formatMoney, formatRange } from "@/lib/currency";
import { cn } from "@/components/ui/core";

/* ---------- Currency ---------- */
const CurrencyContext = createContext({ currency: "USD", setCurrency: () => {} });

export function CurrencyProvider({ initial = "USD", children }) {
  const [currency, setCurrencyState] = useState(CURRENCIES[initial] ? initial : "USD");
  const setCurrency = useCallback((code) => {
    if (!CURRENCIES[code]) return;
    setCurrencyState(code);
    document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
  }, []);
  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);

export function Price({ usd, className }) {
  const { currency } = useCurrency();
  if (usd == null || Number.isNaN(Number(usd))) return <span className={className}>—</span>;
  return <span className={className}>{formatMoney(Number(usd), currency)}</span>;
}

export function PriceRange({ low, high, className }) {
  const { currency } = useCurrency();
  return <span className={className}>{formatRange(low, high, currency)}</span>;
}

export function CurrencySelect({ dark, className }) {
  const { currency, setCurrency } = useCurrency();
  const id = useId();
  return (
    <label htmlFor={id} className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">Display currency</span>
      <select
        id={id}
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-full border pl-3 pr-7 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500/40",
          dark ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-line bg-white text-ink-700 hover:border-ink-300"
        )}
      >
        {Object.keys(CURRENCIES).map((c) => (
          <option key={c} value={c} className="text-ink-900">
            {c}
          </option>
        ))}
      </select>
      <svg aria-hidden className={cn("pointer-events-none absolute right-2.5 h-3 w-3", dark ? "text-white/70" : "text-ink-500")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

/* ---------- Motion helpers ---------- */
export function Reveal({ children, delay = 0, y = 24, className, as = "div", once = true }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

export function CountUp({ to, prefix = "", suffix = "", duration = 1.6, decimals = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, value, onChange, className, size = "md" }) {
  const group = useId();
  return (
    <div role="tablist" className={cn("scrollbar-none flex gap-1 overflow-x-auto rounded-full bg-ink-100/70 p-1", className)}>
      {tabs.map((t) => {
        const active = t.id === value;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
            )}
          >
            {active && <motion.span layoutId={`tab-${group}`} className="absolute inset-0 rounded-full bg-white shadow-soft" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
            <span className="relative inline-flex items-center gap-1.5">
              {Icon && <Icon size={15} aria-hidden />}
              {t.label}
              {t.count != null && t.count > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] leading-4 text-white">{t.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide, footer }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panel.current?.querySelector("input, select, textarea, button");
    first?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
            className={cn("relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:rounded-3xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
              <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && <div className="sticky bottom-0 border-t border-line bg-white px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Toasts ---------- */
const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t, { id, message, tone }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = t.tone === "error" ? AlertTriangle : t.tone === "info" ? Info : CheckCircle2;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-sm text-white shadow-lift"
              >
                <Icon size={18} className={t.tone === "error" ? "text-coral-500" : "text-glow"} aria-hidden />
                <span className="leading-snug">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Data fetching ---------- */
export async function api(path, { method = "GET", body, form } = {}) {
  const res = await fetch(path, {
    method,
    headers: form ? undefined : body ? { "Content-Type": "application/json" } : undefined,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
