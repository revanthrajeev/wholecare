import { PageHeader } from "@/components/ui/core";
import DoctorsBrowser from "@/components/DoctorsBrowser";
import { getPublicDoctors } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Specialist doctors — book a video consultation",
  description: "Find surgeons and specialists at verified hospitals abroad. See experience, languages and consultation fees, and book a video consult.",
};

export default async function DoctorsPage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Doctors" title="Talk to the specialist before you travel" description="Experience, languages and fees up front. Book a 30-minute video consult in the doctor's real availability." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Doctors" }]} />
      <section className="container-wc py-10">
        <DoctorsBrowser doctors={getPublicDoctors()} initialSpecialty={sp?.specialty || ""} />
        <p className="mt-10 text-xs text-ink-400">Doctor profiles shown are sample listings for this demonstration.</p>
      </section>
    </>
  );
}
