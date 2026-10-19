import Link from "next/link";
import { ArrowRight, Video, FileCheck, Users, LineChart, Building2, KanbanSquare, ReceiptText, ShieldCheck, Quote } from "lucide-react";
import HomeHero from "@/components/home/HomeHero";
import PriceExplorer from "@/components/home/PriceExplorer";
import HowItWorks from "@/components/home/HowItWorks";
import Accordion from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/client";
import { SectionHeading, Button, Stars, SampleBadge, formatDate } from "@/components/ui/core";
import { HospitalCard, TreatmentCard, DestinationCard } from "@/components/cards";
import { getPublicHospitals, getPublishedReviews } from "@/lib/data";
import { readDb } from "@/lib/db";
import { TREATMENTS } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";
import { FAQS } from "@/content/faqs";

export const dynamic = "force-dynamic";

const HOME_TREATMENTS = ["total-knee-replacement", "coronary-bypass-cabg", "ivf", "gastric-sleeve", "hair-transplant", "spinal-fusion", "dental-implant", "cancer-treatment-plan"];

export default function Home() {
  const db = readDb();
  const hospitals = getPublicHospitals(db)
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 3);
  const reviews = getPublishedReviews(db).slice(0, 6);
  const hospitalName = Object.fromEntries(db.hospitals.map((h) => [h.id, h.name]));
  const knee = TREATMENTS.find((t) => t.slug === "total-knee-replacement");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <HomeHero />

      {/* PRICE EXPLORER */}
      <section className="relative bg-surface py-24">
        <div className="container-wc">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Know the numbers first" title="What treatment really costs — across seven countries.">
              Indicative ranges for planning, side by side. Switch currency at the top of the page.
            </SectionHeading>
            <Button href="/countries/compare" variant="outline">
              Compare destinations in detail <ArrowRight size={16} aria-hidden />
            </Button>
          </Reveal>
          <Reveal>
            <PriceExplorer />
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="container-wc">
          <Reveal className="mb-6">
            <SectionHeading eyebrow="How it works" title="One case room, from first message to full recovery.">
              Patients, hospitals and your coordinator work from the same record — nothing gets re-explained across WhatsApp threads.
            </SectionHeading>
          </Reveal>
          <HowItWorks />
        </div>
      </section>

      {/* TREATMENTS */}
      <section className="bg-surface py-24">
        <div className="container-wc">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Treatments" title="Popular procedures, with real planning detail.">
              Price ranges, hospital stay, time in country and the questions to ask your surgeon.
            </SectionHeading>
            <Button href="/treatments" variant="outline">
              All {TREATMENTS.length} treatments <ArrowRight size={16} aria-hidden />
            </Button>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_TREATMENTS.map((slug, i) => (
              <Reveal key={slug} delay={i * 0.04} className="h-full">
                <TreatmentCard treatment={TREATMENTS.find((t) => t.slug === slug)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="bg-white py-24">
        <div className="container-wc">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Destinations" title="Choose where — with the trade-offs spelled out.">
              Honest guides covering strengths, visas, flight times, accreditation bodies and what to watch out for.
            </SectionHeading>
            <Button href="/countries" variant="outline">
              All destinations <ArrowRight size={16} aria-hidden />
            </Button>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.04} className={i === 0 ? "h-full lg:col-span-2" : "h-full"}>
                <DestinationCard destination={d} from={knee.prices[d.country]?.[0]} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIST BAND */}
      <section className="hero-night relative overflow-hidden py-24 text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative">
          <Reveal className="mb-12">
            <SectionHeading dark eyebrow="Before you book anything" title="Talk to a specialist first. Decide with confidence.">
              The cheapest decision is the one you don&rsquo;t regret. Start with an expert view of your case.
            </SectionHeading>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Reveal>
              <div className="group h-full rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-glow/40 hover:bg-white/[0.07]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-glow/15 text-glow">
                  <Video size={22} aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl font-bold">Video consultation</h3>
                <p className="mt-3 text-ink-300">A live call with a surgeon or specialist — fee shown before you book, your questions organised in advance, and a link that works in your browser.</p>
                <Button href="/consult" variant="accent" className="mt-8">
                  Book a consult <ArrowRight size={16} aria-hidden />
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="group h-full rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-glow/40 hover:bg-white/[0.07]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-400/15 text-sun-400">
                  <FileCheck size={22} aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl font-bold">Written second opinion</h3>
                <p className="mt-3 text-ink-300">Upload your reports and questions. A specialist reviews them and replies in writing — whether they agree with the plan, and what else they&rsquo;d consider.</p>
                <Button href="/second-opinion" variant="ghostDark" className="mt-8">
                  Request a second opinion <ArrowRight size={16} aria-hidden />
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOSPITALS */}
      <section className="bg-surface py-24">
        <div className="container-wc">
          <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Verified hospitals" title="Every profile shows what was checked, and when.">
              Licence, accreditation, international desk and site visit — hospitals that haven&rsquo;t completed checks aren&rsquo;t listed.
            </SectionHeading>
            <Button href="/hospitals" variant="outline">
              Browse hospitals <ArrowRight size={16} aria-hidden />
            </Button>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {hospitals.map((h, i) => (
              <Reveal key={h.id} delay={i * 0.06} className="h-full">
                <HospitalCard hospital={h} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AFTERCARE */}
      <section className="bg-white py-24">
        <div className="container-wc grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Aftercare" title="Your case doesn't close when you fly home.">
              The biggest gap in medical travel is what happens after discharge. Whole Care keeps the loop open.
            </SectionHeading>
            <ul className="mt-8 space-y-5">
              {[
                { icon: LineChart, t: "Recovery tracker", d: "Log pain and mobility in seconds; your surgeon sees the trend at follow-ups." },
                { icon: Video, t: "Video follow-ups", d: "Scheduled check-ins with the team that treated you." },
                { icon: Users, t: "Private family link", d: "Relatives follow progress and updates — without seeing medical records." },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <f.icon size={20} aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{f.t}</p>
                    <p className="text-ink-500">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-brand-100 via-white to-sun-50 sm:-inset-6" />
              <div className="relative rounded-[28px] border border-line bg-white p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow text-brand-700">Family tracker</p>
                    <p className="mt-1 font-display text-xl font-bold text-ink-900">Fatima&rsquo;s knee replacement</p>
                  </div>
                  <span className="rounded-full bg-ok-50 px-3 py-1 text-xs font-semibold text-ok-700">Recovering well</span>
                </div>
                <ol className="mt-6 space-y-4 border-l-2 border-brand-100 pl-5">
                  {[
                    ["Surgery completed successfully", "20 Aug · Apex Global Hospital"],
                    ["Discharged to partner hotel", "25 Aug"],
                    ["Flew home — recovery plan active", "1 Sep"],
                    ["6-week follow-up complete", "2 Oct"],
                  ].map(([t, d], i) => (
                    <li key={t} className="relative">
                      <span aria-hidden className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${i === 3 ? "bg-brand-600" : "bg-brand-300"}`} />
                      <p className="text-sm font-semibold text-ink-900">{t}</p>
                      <p className="text-xs text-ink-500">{d}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-2xl bg-ink-50 px-4 py-3 text-xs text-ink-500">Example from the demo case. Relatives see milestones only — never reports or messages.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-surface py-24">
        <div className="container-wc">
          <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <SectionHeading eyebrow="Patient reviews" title="What patients say after their case closes." />
            <p className="max-w-sm text-sm text-ink-500">
              The reviews below are <span className="font-semibold text-ink-700">sample content</span> for this demo. Live reviews can only be written by patients with a completed case and carry a &ldquo;Verified patient&rdquo; badge.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.04} className="h-full">
                <figure className="card flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <Stars rating={r.rating} />
                    {r.sample ? <SampleBadge /> : null}
                  </div>
                  <Quote size={22} className="mt-4 text-brand-200" aria-hidden />
                  <blockquote className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-700">{r.text}</blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4 text-sm">
                    <p className="font-semibold text-ink-900">
                      {r.author} <span className="font-normal text-ink-400">· {r.country}</span>
                    </p>
                    <p className="text-xs text-ink-500">
                      {r.procedure} at {hospitalName[r.hospitalId]} · {formatDate(r.date, { month: "short", year: "numeric" })}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOR HOSPITALS */}
      <section className="bg-white py-20">
        <div className="container-wc">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] bg-ink-900 p-8 text-white md:p-12">
              <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
              <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <p className="eyebrow text-glow">For hospitals</p>
                  <h2 className="mt-3 text-3xl font-bold md:text-4xl">Run your international patient desk on Whole Care.</h2>
                  <p className="mt-4 max-w-xl text-ink-300">A pipeline for every inbound case, itemized quote builder, visa-letter generation, patient messaging and response-time analytics — instead of WhatsApp groups and spreadsheets.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href="/for-hospitals" variant="accent">
                      See the hospital portal <ArrowRight size={16} aria-hidden />
                    </Button>
                    <Button href="/signup/hospital" variant="ghostDark">
                      List your hospital
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: KanbanSquare, t: "Case pipeline" },
                    { icon: ReceiptText, t: "Quote builder" },
                    { icon: ShieldCheck, t: "Verification profile" },
                    { icon: Building2, t: "Response analytics" },
                  ].map((f) => (
                    <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <f.icon size={20} className="text-glow" aria-hidden />
                      <p className="mt-3 text-sm font-semibold">{f.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-24">
        <div className="container-wc grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions patients ask us most.">
              Still unsure? Ask the assistant in the corner, or talk to a coordinator.
            </SectionHeading>
            <Button href="/contact" variant="outline" className="mt-8">
              Contact a coordinator
            </Button>
          </Reveal>
          <Reveal delay={0.06}>
            <Accordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="hero-night relative overflow-hidden py-24 text-center text-white">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="container-wc relative">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              Tell us what you need. Get <span className="font-serif font-normal italic text-gradient">itemized</span> quotes in days.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">Free for patients. Share your reports once, compare verified hospitals, and decide with a specialist&rsquo;s input.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button href="/get-quote" variant="accent" size="lg">
                Get a free quote <ArrowRight size={18} aria-hidden />
              </Button>
              <Button href="/consult" variant="ghostDark" size="lg">
                Book a video consult
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
