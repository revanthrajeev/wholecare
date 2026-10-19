"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, ReceiptText, LockKeyhole, HeartPulse, Plane, MapPin } from "lucide-react";
import GlobeHero from "@/components/GlobeHero";
import { PriceRange } from "@/components/ui/client";
import { buttonClass, cn } from "@/components/ui/core";
import { TREATMENTS } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";

const POPULAR = [
  ["Knee replacement", "total-knee-replacement"],
  ["Heart bypass", "coronary-bypass-cabg"],
  ["IVF", "ivf"],
  ["Hair transplant", "hair-transplant"],
];

const PROMISES = [
  { icon: ReceiptText, text: "Itemized quotes before you travel" },
  { icon: ShieldCheck, text: "Accreditation-checked hospitals" },
  { icon: LockKeyhole, text: "Price-lock on the quote you accept" },
  { icon: HeartPulse, text: "Aftercare after you fly home" },
];

function TreatmentSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return TREATMENTS.filter((tr) => `${tr.name} ${tr.specialty} ${tr.summary}`.toLowerCase().includes(t)).slice(0, 6);
  }, [q]);

  function submit(e) {
    e.preventDefault();
    const pick = matches[active];
    if (pick) router.push(`/treatments/${pick.slug}`);
    else router.push(q.trim() ? `/treatments?q=${encodeURIComponent(q.trim())}` : "/treatments");
  }

  return (
    <form onSubmit={submit} className="relative" ref={box}>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] p-1.5 pl-5 shadow-[0_20px_60px_-30px_rgb(45_212_191/0.6)] backdrop-blur-md focus-within:border-glow/60 focus-within:bg-white/10">
        <Search size={19} className="shrink-0 text-ink-300" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(matches.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            }
          }}
          placeholder="What treatment do you need?"
          aria-label="Search treatments"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls="hero-treatment-results"
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-ink-300 focus:outline-none"
        />
        <button type="submit" className={buttonClass({ variant: "accent", size: "md", className: "shrink-0" })}>
          <span className="hidden sm:inline">Compare prices</span>
          <ArrowRight size={18} aria-hidden />
        </button>
      </div>
      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul
            id="hero-treatment-results"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-lift"
          >
            {matches.map((t, i) => (
              <li key={t.slug} role="option" aria-selected={i === active}>
                <Link href={`/treatments/${t.slug}`} onMouseEnter={() => setActive(i)} className={cn("flex items-center justify-between gap-3 rounded-2xl px-4 py-3", i === active ? "bg-brand-50" : "")}>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{t.name}</span>
                    <span className="block text-xs text-ink-500">{t.specialty}</span>
                  </span>
                  {!t.priceOnAssessment && (
                    <span className="text-xs font-semibold text-brand-700">
                      from <PriceRange low={Math.min(...Object.values(t.prices).map((r) => r[0]))} high={Math.min(...Object.values(t.prices).map((r) => r[1]))} />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  );
}

function DestinationCard({ slug, onClose }) {
  const d = DESTINATIONS.find((x) => x.slug === slug);
  const topTreatments = TREATMENTS.filter((t) => t.prices[d.country] && d.strengths.includes(t.specialty)).slice(0, 2);
  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      className="w-[min(340px,86vw)] rounded-3xl border border-white/15 bg-ink-950/70 p-5 text-white shadow-lift backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-glow">Destination</p>
          <p className="mt-1 font-display text-2xl font-bold">{d.country}</p>
        </div>
        <button onClick={onClose} className="rounded-full px-2 py-1 text-xs text-ink-300 hover:bg-white/10 hover:text-white">
          Reset
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-200">{d.tagline}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {(topTreatments.length ? topTreatments : [TREATMENTS[0]]).filter((t) => t.prices[d.country]).map((t) => (
          <div key={t.slug} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <dt className="text-[11px] leading-tight text-ink-300">{t.name.replace(/\s*\(.*\)/, "")}</dt>
            <dd className="mt-1 font-semibold text-glow">
              <PriceRange low={t.prices[d.country][0]} high={t.prices[d.country][1]} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-300">
        <span className="inline-flex items-center gap-1">
          <Plane size={12} aria-hidden /> {d.flightTimes[0].from} {d.flightTimes[0].hours}
        </span>
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={12} aria-hidden /> {d.accreditation.map((a) => a.split(" ")[0]).join(" · ")}
        </span>
      </div>
      <Link href={`/countries/${d.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-glow hover:underline">
        Explore {d.country} <ArrowRight size={14} aria-hidden />
      </Link>
    </motion.div>
  );
}

export default function HomeHero() {
  const [focus, setFocus] = useState(null);
  return (
    <section className="hero-night relative overflow-hidden">
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="container-wc relative grid grid-cols-1 min-h-[100svh] items-center gap-6 pb-10 pt-28 lg:grid-cols-[1.02fr_1fr] lg:gap-2 lg:pb-16 lg:pt-24">
        <div className="relative z-10 max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-ink-200 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-glow" />
            </span>
            Coordinated medical travel across {DESTINATIONS.length} destinations
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-[2.6rem] font-bold leading-[1.02] text-white sm:text-6xl lg:text-[4.1rem]"
          >
            Treatment abroad, <span className="font-serif font-normal italic text-gradient">coordinated</span> from first opinion to full recovery.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.16 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Compare price ranges across countries, get a specialist&rsquo;s view of your reports, and receive itemized quotes from verified hospitals — with visas, travel and aftercare handled in one case room.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.24 }} className="mt-8">
            <TreatmentSearch />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-ink-400">Popular:</span>
              {POPULAR.map(([label, slug]) => (
                <Link key={slug} href={`/treatments/${slug}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-ink-200 transition hover:border-glow/40 hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.4 }} className="mt-10 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-ink-200">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-glow ring-1 ring-white/10">
                  <p.icon size={16} aria-hidden />
                </span>
                {p.text}
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative -mx-5 h-[400px] sm:mx-0 sm:h-[520px] lg:-mr-10 lg:h-[min(720px,84svh)]">
          <GlobeHero focus={focus} onSelect={setFocus} className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-3 lg:bottom-8">
            <AnimatePresence mode="wait">{focus && <div className="pointer-events-auto"><DestinationCard slug={focus} onClose={() => setFocus(null)} /></div>}</AnimatePresence>
            <div className="pointer-events-auto scrollbar-none flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-ink-950/50 p-1.5 backdrop-blur-md">
              {DESTINATIONS.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => setFocus((f) => (f === d.slug ? null : d.slug))}
                  aria-pressed={focus === d.slug}
                  className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition", focus === d.slug ? "bg-glow text-ink-950" : "text-ink-200 hover:bg-white/10 hover:text-white")}
                >
                  {focus === d.slug && <MapPin size={12} aria-hidden />}
                  {d.country}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
