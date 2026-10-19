import { Video, ShieldCheck, Clock, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/core";
import ConsultPicker from "@/components/ConsultPicker";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPublicDoctors } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book a video consultation with a specialist",
  description: "Talk to a surgeon or specialist abroad before you decide. Real availability, fees shown up front, browser-based video calls.",
};

export default async function ConsultPage({ searchParams }) {
  const sp = await searchParams;
  const db = readDb();
  const user = await getCurrentUser(db);
  return (
    <>
      <PageHeader eyebrow="Video consultation" title="Talk to a specialist before you commit to anything" description="Choose a doctor, pick a slot in their real availability, and join from your browser. Your questions and reports can be linked to the call." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Video consultation" }]}>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
          {[
            [Video, "Browser-based video, no app needed"],
            [Clock, "30-minute consults"],
            [FileText, "Link your case and reports"],
            [ShieldCheck, "Doctors at verified hospitals"],
          ].map(([Icon, t]) => (
            <li key={t} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink-200">
              <Icon size={16} className="text-glow" aria-hidden /> {t}
            </li>
          ))}
        </ul>
      </PageHeader>
      <section className="container-wc py-12">
        <ConsultPicker doctors={getPublicDoctors(db)} user={user} initialDoctor={sp?.doctor} />
      </section>
    </>
  );
}
