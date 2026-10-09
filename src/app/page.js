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
};

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

      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#EAF2FF] via-white to-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <Image src="/images/hero/hero_hospital_atrium.jpg" alt="" fill className="object-cover" priority />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_25%,black,transparent_75%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#2F6FED]/14 blur-[130px] animate-glow" />
        <div className="pointer-events-none absolute right-[4%] top-1/4 h-[420px] w-[420px] rounded-full bg-[#FF6B81]/14 blur-[120px] animate-glow [animation-delay:-2s]" />
        <div className="pointer-events-none absolute left-[2%] bottom-[10%] h-[380px] w-[380px] rounded-full bg-[#D9A441]/14 blur-[110px] animate-glow [animation-delay:-3s]" />
        <GlobeHero />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-eyebrow text-xs text-[#2F6FED] tracking-wider uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED]" /> Cross-border healthcare, coordinated
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display mt-7 text-5xl md:text-7xl lg:text-[5.2rem] leading-[1.03] max-w-4xl text-[#10243E]"
          >
            Get the right care,
            <br />
            <em className="italic text-grad">wherever</em> you need it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-[#5B7184] max-w-xl mt-6"
          >
            One coordinated case &mdash; consultation, second opinion,
            hospital comparison, quotation, treatment and recovery &mdash;
            instead of a dozen disconnected agents and WhatsApp threads.
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
              className="border border-[#C8D6E8] text-[#10243E] px-7 py-3.5 rounded-full font-bold hover:bg-[#F3F7FC] transition"
            >
              Hospital Portal demo
            </Link>
          </motion.div>

          {/* floating glass stat chips */}
          <div className="glass absolute left-[4%] top-[24%] hidden animate-float rounded-xl px-4 py-3 text-left xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#5B7184]">India vs. US/UAE cost</p>
            <p className="font-display text-3xl text-[#10243E]">70&ndash;80% less</p>
          </div>
          <div className="glass absolute right-[4%] top-[30%] hidden animate-float rounded-xl px-4 py-3 text-left [animation-delay:-2s] xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#5B7184]">India inbound MVT</p>
            <p className="font-display text-3xl text-[#10243E]">$7.7B<span className="text-base text-[#5B7184]">&rarr;$14.3B</span></p>
          </div>
          <div className="glass absolute left-[8%] bottom-[16%] hidden animate-float rounded-xl px-4 py-3 text-left [animation-delay:-4s] xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#2F6FED]">case coordination, AI-assisted</p>
            <p className="text-sm text-[#10243E]">Not a diagnosis &mdash; a workflow</p>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center text-[#9AADBD] text-xs tracking-widest uppercase animate-bounce">
          scroll
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
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: "TAM",
              title: "Global medical tourism market",
              value: "$126.2B",
              sub: "by 2033, 14.1% CAGR from 2026 (Grand View Research) — inside a $6.8T global wellness economy (Global Wellness Institute, 2024)",
              accent: "#2F6FED",
            },
            {
              tag: "SAM",
              title: "India medical value travel",
              value: "$7.7B → $14.3B",
              sub: "2024 → 2029 (FICCI). India holds ~18% of global MVT, ranked #10 worldwide",
              accent: "#D9A441",
            },
            {
              tag: "SOM",
              title: "Annual inbound patient volume",
              value: "~480K",
              sub: "foreign medical-visa arrivals to India, 2024 — Bangladesh, Iraq, Somalia, Oman, Uzbekistan lead",
              accent: "#FF6B81",
            },
          ].map((card, i) => (
            <motion.div
              key={card.tag}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-8 wc-card wc-card-hover relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: card.accent }} />
              <p className="font-eyebrow text-sm tracking-widest mb-4" style={{ color: card.accent }}>{card.tag}</p>
              <p className="text-5xl font-extrabold mb-2 text-[#10243E]">{card.value}</p>
              <p className="text-[#5B7184] text-sm leading-relaxed">{card.sub}</p>
              <p className="text-[#10243E]/80 text-sm mt-4 font-medium">{card.title}</p>
            </motion.div>
          ))}
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
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                eyebrow: "Directory",
                title: "Verified hospitals & specialists",
                body: "Searchable, filterable by specialty, with accreditation and last-verified dates — not a static PDF list.",
                href: "/directory",
                cta: "Browse directory",
              },
              {
                eyebrow: "Cost Calculator",
                title: "See the full journey cost, transparently",
                body: "Medical + travel + companion costs broken out line by line, with sourced specialty price ranges — not one opaque number.",
                href: "/calculator",
                cta: "Estimate a journey",
              },
              {
                eyebrow: "AI, scoped to workflow",
                title: "AI organizes the case — never diagnoses",
                body: "Structured intake summaries for care coordinators and a pre-consultation question organizer, running on a local model. AI assists; only a clinician decides.",
                href: "/case/new",
                cta: "Start a case",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl wc-card wc-card-hover p-7 flex flex-col"
              >
                <p className="text-[#2F6FED] font-eyebrow text-xs uppercase tracking-widest mb-3">{f.eyebrow}</p>
                <h3 className="font-display text-2xl mb-3">{f.title}</h3>
                <p className="text-[#5B7184] text-sm flex-1">{f.body}</p>
                <Link href={f.href} className="mt-6 text-[#2F6FED] font-semibold text-sm hover:underline">
                  {f.cta} &rarr;
                </Link>
              </motion.div>
            ))}
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

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Stethoscope, step: "01", title: "Describe the need", body: "Patient submits condition, existing diagnosis, budget and timeline — a Case ID is created.", color: "#2F6FED" },
              { icon: FileSearch, step: "02", title: "Review & route", body: "Care team reviews the case, AI organizes it into a structured summary, and it's sent to matched hospitals.", color: "#D9A441" },
              { icon: Building2, step: "03", title: "Hospital responds", body: "Hospitals accept the case in their portal and submit a structured quotation — procedure, doctor, stay, cost.", color: "#FF6B81" },
              { icon: ScrollText, step: "04", title: "Compare & decide", body: "Patient compares quotations side by side on cost, stay length, and provider — not a single opaque number.", color: "#6FA8F5" },
              { icon: Plane, step: "05", title: "Coordinate travel", body: "Visa, flights, hotel and hospital transport line up around the confirmed treatment date.", color: "#D9A441" },
              { icon: HeartPulse, step: "06", title: "Treat & follow up", body: "Treatment, discharge and a structured recovery plan — the relationship continues past the hospital stay.", color: "#2F6FED" },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl wc-card wc-card-hover overflow-hidden"
              >
                {JOURNEY_IMAGES[s.title] && (
                  <div className="relative w-full h-32">
                    <Image src={JOURNEY_IMAGES[s.title]} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color }}>
                      <s.icon size={18} className="text-white" />
                    </div>
                    <span className="font-eyebrow text-xs text-[#9AADBD]">{s.step}</span>
                  </div>
                  <h3 className="font-bold mb-1.5">{s.title}</h3>
                  <p className="text-[#5B7184] text-sm leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
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
            Illustrative demo reviews for this MVP build — not yet collected from live patients.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r, i) => (
              <motion.div key={r.id} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }} className="rounded-2xl wc-card wc-card-hover p-6">
                <Stars count={r.rating} />
                <p className="text-[#344A61] text-sm mt-3 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <p className="text-[#10243E] text-sm font-bold mt-4">{r.author}</p>
                <p className="text-[#9AADBD] text-xs">{r.country} &middot; {r.procedure}</p>
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
      <section className="relative px-10 py-32 overflow-hidden text-center bg-[#F3F7FC]">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_50%,black,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F6FED]/14 blur-[130px] animate-glow" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-[120%] -translate-y-1/2 rounded-full bg-[#FF6B81]/14 blur-[100px] animate-glow [animation-delay:-2s]" />
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative font-display text-4xl md:text-6xl max-w-3xl mx-auto mb-6 text-[#10243E]"
        >
          Built to <span className="text-grad italic">launch</span>, not just to pitch.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="relative text-[#5B7184] max-w-xl mx-auto mb-10"
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
          <Link href="/hospital" className="border border-[#C8D6E8] text-[#10243E] px-7 py-3.5 rounded-full font-bold hover:bg-white transition">
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
            MVP build &middot; NSRCEL AccUbate 2026 &middot; Figures labeled illustrative/indicative are planning estimates, not audited or forecast numbers.
          </p>
        </div>
      </footer>
    </main>
  );
}
