import { FileCheck2, Clock, Stethoscope, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/ui/core";
import CaseWizard from "@/components/CaseWizard";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDoctorBySlug } from "@/lib/data";
import { treatmentBySlug } from "@/content/treatments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Written second opinion from a specialist", description: "Upload your reports and questions. A specialist at a verified hospital reviews them and replies in writing." };

export default async function SecondOpinionPage({ searchParams }) {
  const sp = await searchParams;
  const db = readDb();
  const user = await getCurrentUser(db);
  const doctor = sp?.doctor ? getDoctorBySlug(String(sp.doctor), db) : null;
  const treatment = treatmentBySlug(sp?.treatment);
  const blocked = user && user.role !== "patient";
  return (
    <>
      <PageHeader eyebrow="Second opinion" title="A specialist's written opinion on your case" description="Before major surgery, after a cancer diagnosis, or whenever the plan isn't clear — share your reports and questions, and get a considered written answer." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Second opinion" }]}>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
          {[
            [FileCheck2, "Reviewed from your actual reports"],
            [MessageSquareText, "Your questions answered in writing"],
            [Clock, "Typically within 5 working days"],
            [Stethoscope, "Specialists at verified hospitals"],
          ].map(([Icon, t]) => (
            <li key={t} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-200">
              <Icon size={16} className="text-glow" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </PageHeader>
      <section className="container-wc py-12">
        {blocked ? (
          <p className="card mx-auto max-w-xl p-8 text-center text-ink-600">You&rsquo;re signed in as a {user.role} account. Use a patient account to request a second opinion.</p>
        ) : (
          <CaseWizard mode="second_opinion" user={user} prefill={{ specialty: doctor?.specialty || treatment?.specialty || "", treatment: treatment?.slug || "", doctor: doctor ? { slug: doctor.slug, name: doctor.name, specialty: doctor.specialty, image: doctor.image } : null }} />
        )}
      </section>
    </>
  );
}
