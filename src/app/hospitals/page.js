import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/core";
import HospitalsBrowser from "@/components/HospitalsBrowser";
import { getPublicHospitals } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verified hospitals abroad",
  description: "Browse accreditation-checked hospitals in India, Turkey, Thailand, Singapore, Mexico, the UAE and Malaysia. Compare specialties, languages, ratings and response times.",
};

export default async function HospitalsPage({ searchParams }) {
  const sp = await searchParams;
  const hospitals = getPublicHospitals();
  return (
    <>
      <PageHeader
        eyebrow="Hospitals"
        title="Verified hospitals, compared honestly"
        description="Every listing passes a verification checklist before it appears. Filter by country, specialty, accreditation and language — then compare up to three side by side."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hospitals" }]}
      >
        <Link href="/about#verification" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-ink-200 hover:bg-white/10">
          <ShieldCheck size={16} className="text-glow" aria-hidden /> How we verify hospitals
        </Link>
      </PageHeader>
      <section className="container-wc py-10">
        <HospitalsBrowser hospitals={hospitals} initial={{ q: sp?.q, country: sp?.country, specialty: sp?.specialty }} />
        <p className="mt-10 text-xs text-ink-400">All hospitals shown are sample listings for this demonstration and are not contracted partners.</p>
      </section>
    </>
  );
}
