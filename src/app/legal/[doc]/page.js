import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/core";

const UPDATED = "19 October 2026";

const DOCS = {
  terms: {
    title: "Terms of use",
    intro: "These terms explain how Whole Care works and what you can expect from us. Please read them before creating a case.",
    sections: [
      ["What Whole Care is", "Whole Care is a care-coordination platform. We help you share medical records with hospitals you choose, receive quotes and specialist opinions, book video consultations, and organise travel and follow-up. We are not a hospital, clinic or medical provider and we do not provide medical advice, diagnosis or treatment."],
      ["Hospitals and doctors", "Hospitals and doctors listed on Whole Care are independent providers. They are responsible for the medical care they provide, their fees and their own terms. Listings marked “Sample” are demonstration data and are not contracted partners."],
      ["Quotes and price-locks", "A quote is the hospital's estimate based on the records you shared. When you accept a quote, Whole Care records its exact terms (line items, inclusions, exclusions and validity) as a price-lock certificate visible to you and the hospital. The certificate documents what was agreed; it is not insurance, and clinical findings on admission can change the treatment plan. Any change requires a new quote that you can see and accept or decline."],
      ["Your responsibilities", "Provide accurate information, keep your login secure, and only upload records you are entitled to share. Do not use Whole Care for emergencies — contact local emergency services."],
      ["Payments", "Requesting quotes and using the case room are free for patients. Consultation fees and treatment costs are paid to the hospital under the hospital's terms. Partner hospitals pay Whole Care for coordination."],
      ["Availability and changes", "We work to keep the service available but cannot guarantee uninterrupted access. We may update these terms; material changes will be shown in your dashboard."],
      ["Liability", "To the extent permitted by law, Whole Care is not liable for the medical care provided by hospitals or doctors, or for travel arrangements made with third parties. Nothing in these terms limits liability that cannot be limited by law."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "Your health information is sensitive. This policy explains exactly what we collect, who can see it and the choices you have.",
    sections: [
      ["What we collect", "Account details (name, email, optional phone and country); the case information you enter; documents you upload; messages; consultation bookings; and records of who accessed your case (an audit log). For the assistant we store only usage counts, not your conversation."],
      ["Who can see your case", "You; the hospitals you choose to send your case to, after you give consent; and your Whole Care coordinator. Hospitals do not see each other's quotes. Family links show milestones only — never documents or messages — and you can switch them off at any time."],
      ["Service providers", "Video consultations run on a third-party video service (Jitsi Meet by default). If the AI assistant is enabled with an AI provider, the questions you type are sent to that provider to generate answers. Hospital maps are loaded from OpenStreetMap. We don't sell your data or use advertising trackers."],
      ["Cookies", "We use only essential cookies: a session cookie to keep you signed in and a preference cookie for your display currency."],
      ["Your rights", "From Account settings you can download a copy of your data or delete your account. Deleting your account removes your cases, documents and messages from Whole Care; hospitals may keep their own medical records as required by law."],
      ["Security", "Access to cases is restricted by role and every access is logged. This demonstration environment stores data in a single file and is not suitable for real patient records; production use requires an encrypted database and a signed data-processing agreement with each hospital."],
      ["Contact", "Questions about your data? Use the contact page and choose “Something else”."],
    ],
  },
  "medical-disclaimer": {
    title: "Medical disclaimer",
    intro: "Whole Care provides information and coordination — never medical advice.",
    sections: [
      ["No medical advice", "Content on this site, including treatment guides, price ranges and assistant answers, is general information. It is not a substitute for advice from a qualified clinician who has assessed you."],
      ["Emergencies", "If you have a medical emergency, contact local emergency services immediately. Do not use Whole Care, its messaging or its assistant for urgent care."],
      ["Prices", "Price ranges are indicative planning figures, not quotes. Actual prices depend on the hospital, surgeon, implants, and your clinical assessment."],
      ["AI features", "AI features organise information — such as summarising what you've told us or grouping your questions for a doctor. They do not diagnose, interpret results or recommend treatment, and their output is reviewed by people."],
      ["Second opinions and consultations", "Specialist opinions are based on the records you provide and may change after an in-person examination. Your treating doctors remain responsible for your care."],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }) {
  const { doc } = await params;
  return { title: DOCS[doc]?.title || "Legal" };
}

export default async function LegalPage({ params }) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();
  return (
    <>
      <PageHeader eyebrow="Legal" title={d.title} description={d.intro} breadcrumbs={[{ label: "Home", href: "/" }, { label: d.title }]} />
      <div className="container-wc grid grid-cols-1 gap-10 py-14 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Legal documents" className="space-y-1 lg:sticky lg:top-24 lg:self-start">
          {Object.entries(DOCS).map(([k, v]) => (
            <Link key={k} href={`/legal/${k}`} className={`block rounded-xl px-3 py-2 text-sm ${k === doc ? "bg-ink-900 font-semibold text-white" : "text-ink-600 hover:bg-ink-100"}`}>
              {v.title}
            </Link>
          ))}
        </nav>
        <article className="max-w-3xl">
          <p className="text-sm text-ink-400">Last updated {UPDATED} · Working draft pending legal review</p>
          {d.sections.map(([h, p]) => (
            <section key={h} className="mt-8">
              <h2 className="text-xl font-bold text-ink-900">{h}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-ink-600">{p}</p>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
