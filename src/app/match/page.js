import { PageHeader } from "@/components/ui/core";
import HospitalMatcher from "@/components/HospitalMatcher";
import { getPublicHospitals } from "@/lib/data";
import { treatmentBySlug } from "@/content/treatments";
import { destinationByCountry } from "@/content/destinations";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Find my hospital match",
  description: "Rank verified hospitals for your treatment by budget, destination, ratings, language and reply speed — with every reason shown.",
};

export default async function MatchPage({ searchParams }) {
  const sp = await searchParams;
  const t = treatmentBySlug(typeof sp?.treatment === "string" ? sp.treatment : "");
  const destination = typeof sp?.destination === "string" && destinationByCountry(sp.destination) ? sp.destination : null;
  const languages = [...new Set(getPublicHospitals().flatMap((h) => h.languages || []))].sort();
  return (
    <>
      <PageHeader
        eyebrow="Find my match"
        title="Hospitals ranked for you — with the reasons"
        description="Tell us what matters. We rank verified hospitals and show exactly why each one lands where it does."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Find my match" }]}
      />
      <section className="container-wc py-10">
        <HospitalMatcher initialTreatment={t?.slug || null} initialDestination={destination} languages={languages} />
      </section>
    </>
  );
}
