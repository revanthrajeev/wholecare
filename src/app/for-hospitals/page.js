import { KanbanSquare, ReceiptText, FileSignature, MessagesSquare, BarChart3, BadgeCheck, CalendarCheck, Inbox, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader, SectionHeading, Button } from "@/components/ui/core";

export const metadata = {
  title: "For hospitals — international patient desk software",
  description: "Run your international patient desk on Whole Care: case pipeline, itemized quote builder, visa invitation letters, patient messaging, consult scheduling and analytics.",
};

const FEATURES = [
  { icon: Inbox, t: "Every inbound case in one place", d: "Structured cases with reports attached — no more scattered WhatsApp threads and email chains." },
  { icon: KanbanSquare, t: "Pipeline board", d: "New → reviewing → quoted → accepted → in treatment → discharged, with clear ownership." },
  { icon: ReceiptText, t: "Itemized quote builder", d: "Line items, inclusions, exclusions and validity. Accepted quotes become a shared price-lock record." },
  { icon: FileSignature, t: "Visa invitation letters", d: "Generate a print-ready invitation letter from the case details in one click." },
  { icon: MessagesSquare, t: "Patient messaging", d: "Secure case messaging with notifications, plus milestone updates that feed the family tracker." },
  { icon: CalendarCheck, t: "Consult scheduling", d: "Confirm video consult requests against your doctors' availability and join from the browser." },
  { icon: BarChart3, t: "Response analytics", d: "Response times, quote acceptance and source countries — the numbers international desks rarely have." },
  { icon: BadgeCheck, t: "Verified profile", d: "A public profile showing your accreditation, verification checklist, doctors, packages and verified reviews." },
];

export default function ForHospitalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="For hospitals"
        title="Run your international patient desk on Whole Care"
        description="Qualified cases with complete records, a pipeline your team can actually manage, and quotes patients can compare and trust."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "For hospitals" }]}
        actions={
          <>
            <Button href="/signup/hospital" variant="accent" size="lg">
              List your hospital <ArrowRight size={18} aria-hidden />
            </Button>
            <Button href="/login?next=/hospital" variant="ghostDark" size="lg">
              Partner log in
            </Button>
          </>
        }
      />
      <section className="container-wc py-16">
        <SectionHeading eyebrow="The portal" title="Built around how international desks really work." />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.t} className="card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <f.icon size={20} aria-hidden />
              </span>
              <p className="mt-4 font-bold text-ink-900">{f.t}</p>
              <p className="mt-1 text-sm text-ink-500">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="container-wc grid grid-cols-1 gap-10 lg:grid-cols-2">
          <SectionHeading eyebrow="Getting listed" title="Three steps to your first case." />
          <ol className="space-y-5">
            {[
              ["Create your hospital account", "Add your specialties, languages and international services."],
              ["Complete verification", "Upload your licence and accreditation; our team confirms your international desk and, where possible, visits."],
              ["Receive cases", "Once verified, your profile goes live and patients can send you cases and consult requests."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-bold text-ink-900">{t}</p>
                  <p className="text-ink-500">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-wc py-16">
        <div className="rounded-[32px] bg-ink-900 p-8 text-white md:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">See the portal with demo data</h2>
              <p className="mt-3 text-ink-300">Log in as a demo hospital to explore the pipeline, quote builder and visa letters.</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-200">
                {["apex@demo.com · password demo123", "northstar@demo.com · password demo123"].map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-glow" aria-hidden /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button href="/login?next=/hospital" variant="accent" size="lg">
                Open the demo portal
              </Button>
              <Button href="/contact?topic=partnership" variant="ghostDark" size="lg">
                Talk to us about a pilot
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
