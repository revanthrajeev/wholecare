import { PageHeader } from "@/components/ui/core";
import CountryCompare from "@/components/CountryCompare";
import { getPublicHospitals } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Compare destinations for your treatment",
  description: "Compare one procedure across up to four countries: indicative prices, hospital stay, flight time from your city, visas and accreditation.",
};

export default async function CompareCountriesPage({ searchParams }) {
  const sp = await searchParams;
  const counts = {};
  for (const h of getPublicHospitals()) counts[h.country] = (counts[h.country] || 0) + 1;
  return (
    <>
      <PageHeader eyebrow="Compare destinations" title="One procedure, four countries, side by side" description="Price, stay, flight time from your city, visas and accreditation — so the trade-offs are clear before you request quotes." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Destinations", href: "/countries" }, { label: "Compare" }]} />
      <section className="container-wc py-10">
        <CountryCompare initialTreatment={sp?.treatment} initialCountries={sp?.countries ? String(sp.countries).split(",") : null} hospitalCounts={counts} />
      </section>
    </>
  );
}
