"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Image from "next/image";
import { Stethoscope, FileSearch, Building2, ScrollText, Plane, HeartPulse, Star, ChevronDown } from "lucide-react";
import Nav from "@/components/Nav";

const JOURNEY_IMAGES = {
  "Describe the need": "/images/journey/step_1_records.jpg",
  "Review & route": "/images/journey/step_2_telehealth.jpg",
  "Hospital responds": "/images/journey/step_3_hospital_match.jpg",
  "Compare & decide": "/images/journey/step_4_compare_quotes.jpg",
  "Coordinate travel": "/images/journey/step_5_travel_prep.jpg",
  "Treat & follow up": "/images/journey/step_6_recovery_care.jpg",
};

const REVIEW_AVATARS = ["/images/reviews/avatar_1.jpg", "/images/reviews/avatar_2.jpg", "/images/reviews/avatar_3.jpg", "/images/reviews/avatar_4.jpg", "/images/reviews/avatar_5.jpg", "/images/reviews/avatar_6.jpg"];

const GlobeHero = dynamic(() => import("@/components/GlobeHero"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < count ? "fill-[#D9A441] text-[#D9A441]" : "text-[#E3EAF2]"} />
      ))}
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="wc-card rounded-xl px-6 py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold text-[#10243E]">{q}</span>
        <ChevronDown size={18} className={`text-[#5B7184] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="text-[#5B7184] text-sm mt-3 leading-relaxed">{a}</p>}
    </div>
  );
}

function InquiryForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="wc-card rounded-2xl p-8 text-center">
        <p className="font-bold text-lg mb-1">Thanks — we&rsquo;ll be in touch.</p>
        <p className="text-[#5B7184] text-sm">A care coordinator will follow up at {form.email}.</p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";

  return (
    <form onSubmit={submit} className="wc-card rounded-2xl p-8 grid gap-4 max-w-xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Your name" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <textarea rows={3} placeholder="What do you need help with? (optional)" className={inputClass} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      {status === "error" && <p className="text-sm text-[#C23B5A] font-medium">Something went wrong — please try again.</p>}
      <button disabled={status === "loading"} className="btn-grad py-3.5 rounded-xl font-bold disabled:opacity-50">
        {status === "loading" ? "Sending..." : "Get a free consultation"}
      </button>
      <p className="text-[#9AADBD] text-xs text-center">No case commitment — just a quick way for our team to reach out.</p>
    </form>
  );
}

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetch("/api/reviews").then((r) => r.json()).then(setReviews);
    fetch("/api/faqs").then((r) => r.json()).then(setFaqs);
  }, []);

  return (
    <main className="bg-white text-[#10243E] overflow-hidden">
      <Nav />

      {/* HERO — asymmetric: text pinned left, globe bleeds off the right edge */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFD] border-b border-[#E3EAF2]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[58%] opacity-[0.3]">
          <Image src="/images/hero/hero_hospital_atrium.jpg" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#F8FAFD]/60 to-[#F8FAFD]" />
        </div>
        <div className="pointer-events-none absolute right-[-10%] top-[8%] h-[520px] w-[520px] rounded-full bg-[#2F6FED]/12 blur-[120px]" />

        <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="px-6 sm:px-10 lg:pl-16 pt-32 pb-20">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#2F6FED]/25 bg-white px-4 py-1.5 font-eyebrow text-xs text-[#2F6FED] tracking-wider uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED]" /> Cross-border healthcare, coordinated
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display mt-7 text-5xl md:text-6xl lg:text-[4.6rem] leading-[1.04] max-w-xl text-[#10243E]"
            >
              Get the right care, <em className="italic text-grad">wherever</em> you need it.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[#5B7184] max-w-lg mt-6"
            >
              One coordinated case &mdash; consultation, second opinion, hospital comparison, quotation, treatment and recovery &mdash; instead of a dozen disconnected agents and WhatsApp threads.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex gap-4 mt-10"
            >
              <Link href="/case/new" className="btn-grad px-7 py-3.5 rounded-full font-bold">
                Start a Case
              </Link>
              <Link
                href="/hospital"
                className="border border-[#C8D6E8] text-[#10243E] px-7 py-3.5 rounded-full font-bold hover:bg-white transition"
              >
                Hospital Portal demo
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-8 mt-16 pt-8 border-t border-[#E3EAF2] max-w-lg"
            >
              <div>
                <p className="font-display text-3xl text-[#10243E]">70&ndash;80%</p>
                <p className="text-xs text-[#5B7184] mt-1">lower cost vs. US/UAE</p>
              </div>
              <div className="w-px h-10 bg-[#E3EAF2]" />
              <div>
                <p className="font-display text-3xl text-[#10243E]">$7.7B&rarr;$14.3B</p>
                <p className="text-xs text-[#5B7184] mt-1">India inbound MVT, 2024&ndash;29</p>
              </div>
            </motion.div>
          </div>

          <div className="relative hidden lg:block h-[70vh]">
            <GlobeHero />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section aria-label="Platform capabilities" className="overflow-hidden border-y border-[#E3EAF2] bg-[#F3F7FC] py-4">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-eyebrow text-xs uppercase tracking-widest text-[#5B7184]">
          {[...Array(2)].flatMap((_, rep) =>
            ["Patient Case Room", "Hospital Portal", "Quotation Comparison", "Verified Directory", "AI Case Summaries", "AI Question Organizer", "Cost Calculator", "Open MVP"].map((t, i) => (
              <span key={`${rep}-${t}`} className="flex items-center gap-12">
                {t}<span style={{ color: ["#2F6FED", "#FF6B81", "#D9A441"][i % 3] }}>&#10022;</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* MARKET */}
      <section id="market" className="px-10 py-28 max-w-6xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-3"
        >
          Market Opportunity
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="font-display text-4xl md:text-5xl mb-14 max-w-3xl text-[#10243E]"
        >
          A <span className="text-grad">trillion-dollar</span> global wellness economy, a fast-growing
          cross-border wedge, and India as the entry point.
        </motion.h2>
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-3xl p-10 bg-[#0F2A52] text-white relative overflow-hidden flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute right-[-15%] top-[-20%] h-[320px] w-[320px] rounded-full bg-[#2F6FED]/30 blur-[100px]" />
            <div className="relative">
              <p className="font-eyebrow text-sm tracking-widest mb-4 text-[#6FA8F5]">TAM</p>
              <p className="text-6xl md:text-7xl font-extrabold font-display mb-3">$126.2B</p>
              <p className="text-[#AFC3DB] text-sm leading-relaxed max-w-sm">Global medical tourism market by 2033, 14.1% CAGR from 2026 (Grand View Research) &mdash; inside a $6.8T global wellness economy (Global Wellness Institute, 2024)</p>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {[
              { tag: "SAM", title: "India medical value travel", value: "$7.7B → $14.3B", sub: "2024 → 2029 (FICCI). India holds ~18% of global MVT, ranked #10 worldwide", accent: "#D9A441" },
              { tag: "SOM", title: "Annual inbound patient volume", value: "~480K", sub: "foreign medical-visa arrivals to India, 2024 — Bangladesh, Iraq, Somalia, Oman, Uzbekistan lead", accent: "#FF6B81" },
            ].map((card, i) => (
              <motion.div
                key={card.tag}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="rounded-2xl p-7 border border-[#E3EAF2] bg-white flex items-center gap-5"
              >
                <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: card.accent }} />
                <div>
                  <p className="font-eyebrow text-xs tracking-widest mb-2" style={{ color: card.accent }}>{card.tag} &middot; {card.title}</p>
                  <p className="text-3xl font-extrabold text-[#10243E]">{card.value}</p>
                  <p className="text-[#5B7184] text-xs leading-relaxed mt-2">{card.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-[#9AADBD] text-xs mt-6 max-w-3xl">
          Sources: Grand View Research, Medical Tourism Market, 2026&ndash;2033; Global Wellness Institute, 2025 Global Wellness Economy Monitor; FICCI Medical Value Travel press release; Government of India visa-arrival data via Parliament replies, 2023&ndash;2025. Other research firms (SkyQuest, Coherent, IMARC) estimate materially higher TAM/SAM figures &mdash; the conservative, most defensible citations are used here.
        </p>
      </section>

      {/* FEATURE SHOWCASE — tinted section for rhythm */}
      <section className="bg-[#F3F7FC] text-[#10243E] py-28">
        <div className="px-10 max-w-6xl mx-auto">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-[#2F6FED] font-eyebrow uppercase text-xs tracking-widest mb-3"
          >
            Built for the whole journey
          </motion.p>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl mb-14 max-w-3xl"
          >
            Discovery, cost clarity and AI-assisted coordination &mdash; not just a lead form.
          </motion.h2>
          <div className="grid lg:grid-cols-5 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="lg:col-span-3 rounded-2xl bg-white p-9 flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <p className="text-[#2F6FED] font-eyebrow text-xs uppercase tracking-widest mb-3">AI, scoped to workflow</p>
                <h3 className="font-display text-3xl mb-3 max-w-md">AI organizes the case &mdash; it never diagnoses.</h3>
                <p className="text-[#5B7184] text-sm max-w-md">Structured intake summaries for care coordinators and a pre-consultation question organizer, running on a local model. AI assists; only a clinician decides.</p>
              </div>
              <Link href="/case/new" className="mt-8 text-[#2F6FED] font-semibold text-sm hover:underline w-fit">
                Start a case &rarr;
              </Link>
            </motion.div>

            <div className="lg:col-span-2 grid gap-6">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-white p-7"
              >
                <p className="text-[#D9A441] font-eyebrow text-xs uppercase tracking-widest mb-2">Directory</p>
                <h3 className="font-bold text-lg mb-2">Verified hospitals &amp; specialists</h3>
                <p className="text-[#5B7184] text-sm">Filterable by specialty, with accreditation and last-verified dates.</p>
                <Link href="/directory" className="mt-4 inline-block text-[#2F6FED] font-semibold text-sm hover:underline">Browse &rarr;</Link>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-white p-7"
              >
                <p className="text-[#FF6B81] font-eyebrow text-xs uppercase tracking-widest mb-2">Cost Calculator</p>
                <h3 className="font-bold text-lg mb-2">The full journey cost, line by line</h3>
                <p className="text-[#5B7184] text-sm">Medical + travel + companion costs, not one opaque number.</p>
                <Link href="/calculator" className="mt-4 inline-block text-[#2F6FED] font-semibold text-sm hover:underline">Estimate &rarr;</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETITORS / WHY US */}
      <section id="competitors" className="px-10 py-28 max-w-6xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-3"
        >
          Competitive Landscape
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="font-display text-4xl md:text-5xl mb-14 max-w-3xl"
        >
          Most players are lead-gen marketplaces. We built the <span className="text-grad">operating system</span> underneath.
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { name: "Vaidam Health", gap: "500+ hospitals, 100K+ patients claimed — but pure lead-gen marketplace, no hospital-side operational product" },
            { name: "HealthTrip", gap: "$5M raised, ~500 patients/month — monetizes on travel/hospital commissions, not case infrastructure" },
            { name: "Bookimed / PlacidWay", gap: "1M+ cumulative \"requests\" (not treated patients) — directories and CRM-for-marketing, not case lifecycle tools" },
            { name: "Medigo", gap: "Shut down its medical-travel platform in 2020 after pure facilitation didn't scale; raised $25M in 2024 to rebuild — the clearest proof the lead-gen/concierge model alone fails" },
          ].map((c, i) => (
            <motion.div
              key={c.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-6 wc-card wc-card-hover flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-bold text-[#10243E]">{c.name}</p>
                <p className="text-[#5B7184] text-sm mt-1.5 leading-relaxed">{c.gap}</p>
              </div>
              <span className="text-xs font-bold whitespace-nowrap bg-[#FF6B81]/10 text-[#E0506A] border border-[#FF6B81]/25 px-2.5 py-1 rounded-full">GAP</span>
            </motion.div>
          ))}
        </div>
        <p className="text-[#9AADBD] text-xs mt-6 max-w-3xl">
          Industry analysis independently confirms both gaps: lead-gen marketplaces generate &ldquo;thousands of inquiries that lack seriousness... high drop-off, rising cost per acquisition&rdquo;; and hospital international-patient teams &ldquo;lack specialized software&rdquo; to track visas, pre-op tests, travel dates and discharge &mdash; coordinated manually across disconnected systems. Nearly the entire competitive set is thinly funded (Vaidam, Bookimed, Mozocare all under $1M disclosed) &mdash; a weak field for a product-led, well-capitalized entrant to out-build on operational depth.
        </p>
      </section>

      {/* TRUST / TRACTION BAND */}
      <section className="relative px-10 py-20 overflow-hidden border-y border-[#E3EAF2] bg-[#0F2A52]">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#2F6FED]/25 blur-[110px]" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: "15", label: "architecture levels mapped, P0 build live" },
            { value: "6", label: "working product surfaces in this MVP" },
            { value: "70–80%", label: "lower cost vs. US/UAE for comparable care" },
            { value: "$0", label: "raised from a thinly-funded competitive field" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.08 }}
            >
              <p className="font-display text-4xl md:text-5xl text-grad">{s.value}</p>
              <p className="text-[#AFC3DB] text-sm mt-2 leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PIPELINE — how a case moves */}
      <section id="how" className="bg-white text-[#10243E] py-28">
        <div className="px-10 max-w-6xl mx-auto">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-[#2F6FED] font-eyebrow uppercase text-xs tracking-widest mb-3"
          >
            How a case moves
          </motion.p>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl mb-6 max-w-3xl"
          >
            One case, one thread, from first message to full recovery.
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-[#5B7184] max-w-2xl mb-16"
          >
            Every stage hands off cleanly to the next — nothing gets re-explained over WhatsApp, and the hospital, the patient and the care coordinator are always looking at the same record.
          </motion.p>

          <div className="mb-20">
            {[
              { icon: Stethoscope, step: "01", title: "Describe the need", body: "Patient submits condition, existing diagnosis, budget and timeline — a Case ID is created.", color: "#2F6FED" },
              { icon: FileSearch, step: "02", title: "Review & route", body: "Care team reviews the case, AI organizes it into a structured summary, and it's sent to matched hospitals.", color: "#D9A441" },
              { icon: Building2, step: "03", title: "Hospital responds", body: "Hospitals accept the case in their portal and submit a structured quotation — procedure, doctor, stay, cost.", color: "#FF6B81" },
              { icon: ScrollText, step: "04", title: "Compare & decide", body: "Patient compares quotations side by side on cost, stay length, and provider — not a single opaque number.", color: "#6FA8F5" },
              { icon: Plane, step: "05", title: "Coordinate travel", body: "Visa, flights, hotel and hospital transport line up around the confirmed treatment date.", color: "#D9A441" },
              { icon: HeartPulse, step: "06", title: "Treat & follow up", body: "Treatment, discharge and a structured recovery plan — the relationship continues past the hospital stay.", color: "#2F6FED" },
            ].map((s, i) => {
              const reverse = i % 2 === 1;
              return (
                <motion.div
                  key={s.step}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.05 }}
                  className={`grid md:grid-cols-2 gap-8 items-center py-10 ${i !== 0 ? "border-t border-[#E3EAF2]" : ""}`}
                >
                  <div className={reverse ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: s.color }}>
                        <s.icon size={16} className="text-white" />
                      </div>
                      <span className="font-eyebrow text-xs text-[#9AADBD] tracking-widest">STEP {s.step}</span>
                    </div>
                    <h3 className="font-display text-2xl mb-2">{s.title}</h3>
                    <p className="text-[#5B7184] text-sm leading-relaxed max-w-sm">{s.body}</p>
                  </div>
                  {JOURNEY_IMAGES[s.title] && (
                    <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F7FC] ${reverse ? "md:order-1" : ""}`}>
                      <Image src={JOURNEY_IMAGES[s.title]} alt="" fill className="object-contain p-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {["Submitted", "Under Review", "Sent to Hospitals", "Quotation Received", "Confirmed", "Completed"].map(
              (s, i, arr) => (
                <motion.div
                  key={s}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <span className="px-5 py-2.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-sm font-semibold">
                    {s}
                  </span>
                  {i < arr.length - 1 && <span className="text-[#9AADBD]">&rarr;</span>}
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#F3F7FC] px-10 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[#2F6FED] font-eyebrow uppercase text-xs tracking-widest mb-3">
            Patient Reviews
          </motion.p>
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl md:text-5xl mb-4 max-w-3xl">
            What patients say after their case closes.
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[#9AADBD] text-xs mb-14 max-w-2xl">
            Illustrative demo reviews for this build — not yet collected from live patients.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r, i) => (
              <motion.div key={r.id} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }} className="rounded-2xl wc-card wc-card-hover p-6">
                <Stars count={r.rating} />
                <p className="text-[#344A61] text-sm mt-3 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-4">
                  {REVIEW_AVATARS[i % REVIEW_AVATARS.length] && (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#E3EAF2]">
                      <Image src={REVIEW_AVATARS[i % REVIEW_AVATARS.length]} alt={r.author} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-[#10243E] text-sm font-bold">{r.author}</p>
                    <p className="text-[#9AADBD] text-xs">{r.country} &middot; {r.procedure}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-10 py-28 max-w-4xl mx-auto">
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[#2F6FED] font-eyebrow uppercase text-xs tracking-widest mb-3 text-center">
          FAQ
        </motion.p>
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="font-display text-4xl md:text-5xl mb-14 text-center">
          Common questions
        </motion.h2>
        <div className="grid gap-4">
          {faqs.map((f, i) => (
            <motion.div key={f.q} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
              <FaqItem q={f.q} a={f.a} defaultOpen={i === 0} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* LEAD CAPTURE */}
      <section className="bg-[#F3F7FC] px-10 py-28">
        <div className="max-w-xl mx-auto text-center mb-10">
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[#2F6FED] font-eyebrow uppercase text-xs tracking-widest mb-3">
            Not ready for a full case yet?
          </motion.p>
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="font-display text-3xl md:text-4xl">
            Talk to a care coordinator first.
          </motion.h2>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <InquiryForm />
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-10 py-32 overflow-hidden text-center bg-[#0F2A52] text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.25]">
          <Image src="/images/journey/step_6_recovery_care.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0F2A52]" />
        </div>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative font-display text-4xl md:text-6xl max-w-3xl mx-auto mb-6 text-white"
        >
          Built to <span className="text-grad italic">launch</span>, not just to pitch.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="relative text-[#AFC3DB] max-w-xl mx-auto mb-10"
        >
          Every flow on this site is a working MVP, not a mockup. Try the patient case flow or the hospital portal yourself.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="relative flex flex-wrap gap-4 justify-center"
        >
          <Link href="/case/new" className="btn-grad px-7 py-3.5 rounded-full font-bold">
            Start a Case
          </Link>
          <Link href="/hospital" className="border border-white/30 text-white px-7 py-3.5 rounded-full font-bold hover:bg-white/10 transition">
            Hospital Portal demo
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E3EAF2] px-10 py-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md wc-gradient" />
            <span className="font-bold text-sm tracking-wide text-[#10243E]">WHOLE CARE</span>
          </div>
          <p className="text-[#9AADBD] text-xs text-center">
            Figures labeled illustrative/indicative are planning estimates, not audited or forecast numbers.
          </p>
        </div>
      </footer>
    </main>
  );
}
