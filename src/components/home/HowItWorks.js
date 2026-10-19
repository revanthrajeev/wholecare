"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { FileText, CheckCircle2, Video, ReceiptText, LockKeyhole, Plane, Hotel, Car, FileCheck, HeartPulse, Users, UploadCloud, Clock } from "lucide-react";
import { cn } from "@/components/ui/core";

const STEPS = [
  { title: "Share your reports, once", body: "Upload scans, lab results and your doctor's letter. You decide which hospitals can see them — and every access is logged.", icon: UploadCloud },
  { title: "Get a specialist's view", body: "Book a video consult or request a written second opinion. A specialist confirms whether the recommended plan fits your case.", icon: Video },
  { title: "Compare itemized quotes", body: "Hospitals respond with line-by-line quotes: surgeon, stay, implants, exclusions and validity. No more single opaque numbers.", icon: ReceiptText },
  { title: "Lock the price, plan the trip", body: "Accept a quote and its terms are recorded as a price-lock. Your visa letter, flights, stay and airport pickup line up around the treatment date.", icon: LockKeyhole },
  { title: "Recover with support at home", body: "A recovery plan, video follow-ups and a simple tracker continue after you fly home — and family can follow along privately.", icon: HeartPulse },
];

function Row({ icon: Icon, title, meta, done, tone = "brand" }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3">
      <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone === "sun" ? "bg-sun-50 text-sun-700" : "bg-brand-50 text-brand-700")}>
        <Icon size={16} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
        {meta && <p className="truncate text-xs text-ink-500">{meta}</p>}
      </div>
      {done && <CheckCircle2 size={18} className="shrink-0 text-ok-600" aria-label="Done" />}
    </div>
  );
}

function Screen({ step }) {
  if (step === 0)
    return (
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Documents</p>
        <Row icon={FileText} title="angiogram_report.pdf" meta="Uploaded · 2.1 MB" done />
        <Row icon={FileText} title="echocardiogram.pdf" meta="Uploaded · 860 KB" done />
        <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink-900">discharge_summary.pdf</span>
            <span className="text-xs text-brand-700">72%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <motion.div className="h-full rounded-full bg-brand-600" initial={{ width: "20%" }} animate={{ width: "72%" }} transition={{ duration: 1.4 }} />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-ink-50 px-3.5 py-3 text-xs text-ink-600">
          <LockKeyhole size={14} aria-hidden /> Shared only with hospitals you choose · access logged
        </div>
      </div>
    );
  if (step === 1)
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-ink-900 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-ink-700 font-display font-bold">AR</span>
            <div>
              <p className="font-semibold">Dr. Arvind Rao</p>
              <p className="text-xs text-ink-300">Cardiac Surgery · Apex Global Hospital</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <Clock size={14} aria-hidden /> Thu 23 Oct · 10:30 IST
            </span>
            <span className="rounded-full bg-glow px-3 py-1 text-xs font-semibold text-ink-950">Join call</span>
          </div>
        </div>
        <Row icon={FileCheck} title="Written second opinion" meta="Orthopedics · due in 5 days" tone="sun" />
        <div className="rounded-2xl border border-line bg-white p-3.5 text-xs text-ink-600">
          <p className="mb-1.5 font-semibold text-ink-900">Your questions, organised</p>
          <p>• Bypass or stents — which fits my angiogram?</p>
          <p>• How long before I can fly home?</p>
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { h: "Apex Global", total: "$7,000", stay: "8 nights", items: ["Surgeon & anaesthesia $2,600", "Stay incl. ICU $2,350", "Theatre $1,250"] },
          { h: "Northstar H&J", total: "$7,450", stay: "7 nights + hotel", items: ["Surgeon & anaesthesia $2,900", "Stay incl. ICU $2,100", "3 hotel nights $450"], best: true },
        ].map((q) => (
          <div key={q.h} className={cn("rounded-2xl border bg-white p-3.5", q.best ? "border-brand-400 ring-2 ring-brand-500/20" : "border-line")}>
            {q.best && <span className="mb-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800">Includes hotel</span>}
            <p className="text-sm font-semibold text-ink-900">{q.h}</p>
            <p className="font-display text-2xl font-bold text-ink-900">{q.total}</p>
            <p className="text-[11px] text-ink-500">{q.stay}</p>
            <div className="mt-2 space-y-1 border-t border-line pt-2">
              {q.items.map((i) => (
                <p key={i} className="truncate text-[11px] text-ink-600">
                  {i}
                </p>
              ))}
            </div>
          </div>
        ))}
        <p className="col-span-2 rounded-xl bg-ink-50 px-3 py-2 text-center text-xs text-ink-600">Valid 21–30 days · exclusions listed on every quote</p>
      </div>
    );
  if (step === 3)
    return (
      <div className="space-y-2.5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-ink-900 p-4 text-white">
          <div aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[10px] border-white/10" />
          <p className="text-xs text-brand-100">Price-lock certificate</p>
          <p className="mt-1 font-display text-2xl font-bold">$6,450 locked</p>
          <p className="mt-1 text-xs text-brand-100">WC-LOCK-3F8K2 · valid to 30 Sep</p>
        </div>
        <Row icon={FileCheck} title="Visa invitation letter" meta="Issued by hospital" done />
        <Row icon={Plane} title="Flight EK 568" meta="Arrives 18 Aug · 22:10" done />
        <Row icon={Car} title="Airport pickup" meta="Driver confirmed" done />
        <Row icon={Hotel} title="Partner hotel" meta="1.2 km from hospital · 10 nights" done />
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-900">Recovery tracker</p>
          <span className="text-xs text-ok-700">Pain ↓ 71%</span>
        </div>
        <svg viewBox="0 0 260 90" className="mt-2 h-24 w-full" aria-label="Pain score falling from 7 to 2 over six weeks">
          {[0, 1, 2].map((i) => (
            <line key={i} x1="0" x2="260" y1={15 + i * 30} y2={15 + i * 30} stroke="#e9eef4" strokeWidth="1" />
          ))}
          <motion.path
            d="M5 18 L40 28 L80 40 L120 50 L160 62 L200 64 L255 72"
            fill="none"
            stroke="#0E8F82"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 }}
          />
          <circle cx="255" cy="72" r="4" fill="#0E8F82" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
      <Row icon={Video} title="6-week follow-up video call" meta="Done · Dr. Kapoor" done />
      <Row icon={CheckCircle2} title="Staple removal at local clinic" meta="Done" done />
      <Row icon={Users} title="Family tracker" meta="3 relatives following privately" tone="sun" />
    </div>
  );
}

function Step({ index, step, onActive }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  return (
    <div ref={ref} className="flex min-h-0 flex-col justify-center py-8 lg:min-h-[52vh]">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <step.icon size={20} aria-hidden />
      </span>
      <p className="mt-4 eyebrow text-ink-400">Step {index + 1}</p>
      <h3 className="mt-1 text-2xl font-bold text-ink-900 md:text-3xl">{step.title}</h3>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-500">{step.body}</p>
      <div className="mt-6 lg:hidden">
        <div className="rounded-[28px] border border-line bg-surface p-4 shadow-soft">
          <Screen step={index} />
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20">
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative mx-auto w-full max-w-[440px] rounded-[36px] border border-ink-200 bg-white p-3 shadow-lift">
            <div className="rounded-[28px] bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-coral-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sun-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-400/80" />
                </div>
                <span className="text-xs font-semibold text-ink-400">Case room · {STEPS[active].title.split(",")[0]}</span>
              </div>
              <div className="relative min-h-[340px]">
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, y: 14, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.4 }}>
                    <Screen step={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s.title} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-brand-600" : "w-1.5 bg-ink-200")} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        {STEPS.map((s, i) => (
          <Step key={s.title} index={i} step={s} onActive={setActive} />
        ))}
      </div>
    </div>
  );
}
