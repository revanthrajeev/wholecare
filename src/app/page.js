"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Stethoscope, FileSearch, Building2, ScrollText, Plane, HeartPulse } from "lucide-react";
import Nav from "@/components/Nav";

const GlobeHero = dynamic(() => import("@/components/GlobeHero"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Home() {
  return (
    <main className="bg-[#05090d] text-white overflow-hidden">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_30%,black,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#2E7D78]/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-[#C9A66B]/10 blur-[100px]" />
        <GlobeHero />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05090d]/35 to-[#05090d] pointer-events-none" />
        <div className="noise absolute inset-0 pointer-events-none" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-eyebrow text-xs text-[#cfe0e8] tracking-wider uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8fd6cc]" /> Cross-border healthcare, coordinated
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display mt-7 text-5xl md:text-7xl lg:text-[5.2rem] leading-[1.03] max-w-4xl"
          >
            Get the right care,
            <br />
            <em className="italic text-[#8fd6cc]">wherever</em> you need it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-[#9db3c4] max-w-xl mt-6"
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
            <Link
              href="/case/new"
              className="btn-grad px-7 py-3.5 rounded-full font-bold"
            >
              Start a Case
            </Link>
            <Link
              href="/hospital"
              className="border border-white/30 px-7 py-3.5 rounded-full font-bold hover:bg-white/10 transition"
            >
              Hospital Portal demo
            </Link>
          </motion.div>

          {/* floating glass stat chips */}
          <div className="glass absolute left-[4%] top-[24%] hidden animate-float rounded-xl px-4 py-3 text-left xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#9db3c4]">India vs. US/UAE cost</p>
            <p className="font-display text-3xl">70&ndash;80% less</p>
          </div>
          <div className="glass absolute right-[4%] top-[30%] hidden animate-float rounded-xl px-4 py-3 text-left [animation-delay:-2s] xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#9db3c4]">India inbound MVT</p>
            <p className="font-display text-3xl">$7.7B<span className="text-base text-[#9db3c4]">&rarr;$14.3B</span></p>
          </div>
          <div className="glass absolute left-[8%] bottom-[16%] hidden animate-float rounded-xl px-4 py-3 text-left [animation-delay:-4s] xl:block">
            <p className="font-eyebrow text-[10px] uppercase text-[#8fd6cc]">case coordination, AI-assisted</p>
            <p className="text-sm text-[#cfe0e8]">Not a diagnosis &mdash; a workflow</p>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center text-[#4B5D6B] text-xs tracking-widest uppercase animate-bounce">
          scroll
        </div>
      </section>

      {/* MARQUEE */}
      <section aria-label="Platform capabilities" className="overflow-hidden border-y border-white/10 bg-[#0d1b2c] py-4 border-y border-[#8fd6cc]/10">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-eyebrow text-xs uppercase tracking-widest text-[#9db3c4]">
          {[...Array(2)].flatMap(() =>
            ["Patient Case Room", "Hospital Portal", "Quotation Comparison", "Verified Directory", "AI Case Summaries", "AI Question Organizer", "Cost Calculator", "Open MVP"].map((t, i) => (
              <span key={t + i} className="flex items-center gap-12">
                {t}<span className="text-[#8fd6cc]">&#10022;</span>
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
          className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-3"
        >
          Market Opportunity
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="font-display text-4xl md:text-5xl mb-14 max-w-3xl"
        >
          A trillion-dollar global wellness economy, a fast-growing
          cross-border wedge, and India as the entry point.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              tag: "TAM",
              title: "Global medical tourism market",
              value: "$126.2B",
              sub: "by 2033, 14.1% CAGR from 2026 (Grand View Research) — inside a $6.8T global wellness economy (Global Wellness Institute, 2024)",
              accent: "#8fd6cc",
            },
            {
              tag: "SAM",
              title: "India medical value travel",
              value: "$7.7B → $14.3B",
              sub: "2024 → 2029 (FICCI). India holds ~18% of global MVT, ranked #10 worldwide",
              accent: "#C9A66B",
            },
            {
              tag: "SOM",
              title: "Annual inbound patient volume",
              value: "~480K",
              sub: "foreign medical-visa arrivals to India, 2024 — Bangladesh, Iraq, Somalia, Oman, Uzbekistan lead",
              accent: "#7ea6e0",
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
              <p className="text-5xl font-extrabold mb-2">{card.value}</p>
              <p className="text-[#9db3c4] text-sm leading-relaxed">{card.sub}</p>
              <p className="text-white/80 text-sm mt-4 font-medium">{card.title}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-[#4B5D6B] text-xs mt-6 max-w-3xl">
          Sources: Grand View Research, Medical Tourism Market, 2026&ndash;2033; Global Wellness Institute, 2025 Global Wellness Economy Monitor; FICCI Medical Value Travel press release; Government of India visa-arrival data via Parliament replies, 2023&ndash;2025. Other research firms (SkyQuest, Coherent, IMARC) estimate materially higher TAM/SAM figures &mdash; the conservative, most defensible citations are used here.
        </p>
      </section>

      {/* FEATURE SHOWCASE — light section for rhythm */}
      <section className="bg-[#F7FAF9] text-[#0E2A47] py-28">
        <div className="px-10 max-w-6xl mx-auto">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-[#2E7D78] font-eyebrow uppercase text-xs tracking-widest mb-3"
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
                className="rounded-2xl bg-white border border-[#e3eceb] p-7 flex flex-col"
              >
                <p className="text-[#2E7D78] font-eyebrow text-xs uppercase tracking-widest mb-3">{f.eyebrow}</p>
                <h3 className="font-display text-2xl mb-3">{f.title}</h3>
                <p className="text-[#4B5D6B] text-sm flex-1">{f.body}</p>
                <Link href={f.href} className="mt-6 text-[#2E7D78] font-semibold text-sm hover:underline">
                  {f.cta} &rarr;
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITORS / WHY US */}
      <section id="competitors" className="px-10 py-28 max-w-6xl mx-auto border-t border-white/5">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-3"
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
          Most players are lead-gen marketplaces. We built the operating system underneath.
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
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-[#9db3c4] text-sm mt-1.5 leading-relaxed">{c.gap}</p>
              </div>
              <span className="text-xs font-bold whitespace-nowrap bg-rose-500/10 text-rose-300 border border-rose-500/25 px-2.5 py-1 rounded-full">GAP</span>
            </motion.div>
          ))}
        </div>
        <p className="text-[#4B5D6B] text-xs mt-6 max-w-3xl">
          Industry analysis independently confirms both gaps: lead-gen marketplaces generate &ldquo;thousands of inquiries that lack seriousness... high drop-off, rising cost per acquisition&rdquo;; and hospital international-patient teams &ldquo;lack specialized software&rdquo; to track visas, pre-op tests, travel dates and discharge &mdash; coordinated manually across disconnected systems. Nearly the entire competitive set is thinly funded (Vaidam, Bookimed, Mozocare all under $1M disclosed) &mdash; a weak field for a product-led, well-capitalized entrant to out-build on operational depth.
        </p>
      </section>

      {/* TRUST / TRACTION BAND */}
      <section className="relative px-10 py-20 overflow-hidden border-y border-white/10 bg-[#0d1b2c]">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#8fd6cc]/10 blur-[110px]" />
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
              <p className="text-[#9db3c4] text-sm mt-2 leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PIPELINE — how a case moves, light section for rhythm */}
      <section id="how" className="bg-[#F7FAF9] text-[#0E2A47] py-28">
        <div className="px-10 max-w-6xl mx-auto">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-[#2E7D78] font-eyebrow uppercase text-xs tracking-widest mb-3"
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
            className="text-[#4B5D6B] max-w-2xl mb-16"
          >
            Every stage hands off cleanly to the next — nothing gets re-explained over WhatsApp, and the hospital, the patient and the care coordinator are always looking at the same record.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Stethoscope, step: "01", title: "Describe the need", body: "Patient submits condition, existing diagnosis, budget and timeline — a Case ID is created." },
              { icon: FileSearch, step: "02", title: "Review & route", body: "Care team reviews the case, AI organizes it into a structured summary, and it's sent to matched hospitals." },
              { icon: Building2, step: "03", title: "Hospital responds", body: "Hospitals accept the case in their portal and submit a structured quotation — procedure, doctor, stay, cost." },
              { icon: ScrollText, step: "04", title: "Compare & decide", body: "Patient compares quotations side by side on cost, stay length, and provider — not a single opaque number." },
              { icon: Plane, step: "05", title: "Coordinate travel", body: "Visa, flights, hotel and hospital transport line up around the confirmed treatment date." },
              { icon: HeartPulse, step: "06", title: "Treat & follow up", body: "Treatment, discharge and a structured recovery plan — the relationship continues past the hospital stay." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl bg-white border border-[#e3eceb] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl wc-gradient flex items-center justify-center">
                    <s.icon size={18} className="text-[#06120f]" />
                  </div>
                  <span className="font-eyebrow text-xs text-[#9db3c4]">{s.step}</span>
                </div>
                <h3 className="font-bold mb-1.5">{s.title}</h3>
                <p className="text-[#4B5D6B] text-sm leading-relaxed">{s.body}</p>
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
                  <span className="px-5 py-2.5 rounded-full bg-[#E8F4F2] text-[#2E7D78] text-sm font-semibold">
                    {s}
                  </span>
                  {i < arr.length - 1 && <span className="text-[#9db3c4]">&rarr;</span>}
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-10 py-32 overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_50%,black,transparent_70%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E7D78]/20 blur-[130px]" />
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative font-display text-4xl md:text-6xl max-w-3xl mx-auto mb-6"
        >
          Built to <span className="text-grad italic">launch</span>, not just to pitch.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="relative text-[#9db3c4] max-w-xl mx-auto mb-10"
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
          <Link href="/hospital" className="border border-white/30 px-7 py-3.5 rounded-full font-bold hover:bg-white/10 transition">
            Hospital Portal demo
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-10 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md wc-gradient" />
            <span className="font-bold text-sm tracking-wide">WHOLE CARE</span>
          </div>
          <p className="text-[#4B5D6B] text-xs text-center">
            MVP build &middot; NSRCEL AccUbate 2026 &middot; Figures labeled illustrative/indicative are planning estimates, not audited or forecast numbers.
          </p>
        </div>
      </footer>
    </main>
  );
}
