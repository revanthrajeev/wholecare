import { ShieldCheck, FileCheck2, Building2, MapPinned, Eye, HandCoins, Users, Lock } from "lucide-react";
import { PageHeader, SectionHeading, Button } from "@/components/ui/core";

export const metadata = {
  title: "About Whole Care",
  description: "Why Whole Care exists, how hospitals are verified, how we earn money, and the people building it.",
};

const CHECKS = [
  { icon: FileCheck2, t: "Operating licence", d: "We confirm the hospital is licensed to operate by the national or state health authority." },
  { icon: ShieldCheck, t: "Accreditation", d: "Certificates (JCI, NABH, HA Thailand, MSQH and others) are checked for scope and expiry." },
  { icon: Building2, t: "International patient desk", d: "A named team handles international patients, with interpreters and documented response times." },
  { icon: MapPinned, t: "Site visit", d: "Where possible our team visits in person. Each profile shows which checks are complete and when." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="Making cross-border care something you can actually trust" description="Patients travel for treatment because care at home is too expensive, too slow or unavailable. The hard part isn't the flight — it's knowing who to trust, what it will really cost, and what happens after you fly home." breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]} />

      <section className="container-wc grid grid-cols-1 gap-12 py-16 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="What we do" title="One coordinated case instead of a dozen disconnected conversations." />
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink-600">
            <p>Most medical-travel platforms are directories or lead forms: they pass your details to clinics and step back. Whole Care keeps everything in one case room — your reports, specialist opinions, itemized quotes, messages, travel and recovery — shared with the hospitals you choose.</p>
            <p>We don&rsquo;t diagnose or treat. Licensed clinicians at the hospital you choose make every clinical decision. Our job is to make that decision well-informed, the price clear, and the journey coordinated end to end.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Eye, t: "Transparent pricing", d: "Indicative ranges up front; itemized quotes with exclusions and validity; price-lock on the quote you accept." },
            { icon: Lock, t: "Your data, your choice", d: "Records are shared only with hospitals you select, after explicit consent. Every access is logged." },
            { icon: Users, t: "Continuity after you fly home", d: "Recovery plans, follow-ups and a private family link keep the loop open after discharge." },
            { icon: HandCoins, t: "Free for patients", d: "Quotes and coordination are free. Partner hospitals pay Whole Care for coordination; consult fees are shown before booking." },
          ].map((f) => (
            <div key={f.t} className="card p-6">
              <f.icon size={22} className="text-brand-600" aria-hidden />
              <p className="mt-4 font-bold text-ink-900">{f.t}</p>
              <p className="mt-1 text-sm text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="verification" className="bg-white py-16">
        <div className="container-wc">
          <SectionHeading eyebrow="How we verify hospitals" title="Four checks before a hospital appears — shown on every profile.">
            Hospitals that haven&rsquo;t completed verification are not listed publicly, and patients can&rsquo;t send cases to them.
          </SectionHeading>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CHECKS.map((c, i) => (
              <div key={c.t} className="card relative p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-ink-100">0{i + 1}</span>
                <c.icon size={22} className="text-brand-600" aria-hidden />
                <p className="mt-4 font-bold text-ink-900">{c.t}</p>
                <p className="mt-1 text-sm text-ink-500">{c.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-500">Accreditation reduces systemic risk; it doesn&rsquo;t rate individual surgeons. That&rsquo;s why every quote names the doctor and every patient can consult them first.</p>
        </div>
      </section>

      <section className="container-wc grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="Why now" title="A large, fast-growing need with no trusted household name." />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["$126.2B", "Global medical tourism market projected by 2033 (Grand View Research)"],
            ["14.1%", "Projected annual growth (CAGR) from 2026 (Grand View Research)"],
            ["~480K", "Foreign medical-visa arrivals to India in 2024 (Government of India data)"],
          ].map(([v, d]) => (
            <div key={v} className="card p-6">
              <p className="font-display text-3xl font-bold text-ink-900">{v}</p>
              <p className="mt-2 text-sm text-ink-500">{d}</p>
            </div>
          ))}
          <p className="text-xs text-ink-400 sm:col-span-3">Sources: Grand View Research, Medical Tourism Market report (2026–2033); Government of India visa-arrival data via Parliament replies. Research firms differ widely on market size; conservative citations are used.</p>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-wc grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Team" title="Built by founders who think the hard part is trust, not traffic." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {["Ayon Paul", "Revanth Rajeev"].map((n) => (
              <div key={n} className="card flex items-center gap-4 p-6">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-ink-800 font-display text-lg font-bold text-white">
                  {n.split(" ").map((w) => w[0]).join("")}
                </span>
                <div>
                  <p className="font-bold text-ink-900">{n}</p>
                  <p className="text-sm text-ink-500">Co-founder</p>
                </div>
              </div>
            ))}
            <div className="card p-6 sm:col-span-2">
              <p className="font-semibold text-ink-900">Where we are today</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">Whole Care is an early-stage company. The platform you&rsquo;re using is fully working, but hospitals, doctors, packages and reviews marked &ldquo;Sample&rdquo; are demonstration data while we sign our first hospital partners. We&rsquo;d rather tell you that than imply a network we don&rsquo;t have yet.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wc py-16 text-center">
        <h2 className="text-3xl font-bold text-ink-900">Have a question for the team?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/contact">Contact us</Button>
          <Button href="/for-hospitals" variant="outline">
            Partner with us
          </Button>
        </div>
      </section>
    </>
  );
}
