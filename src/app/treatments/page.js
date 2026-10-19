import { PageHeader } from "@/components/ui/core";
import TreatmentsBrowser from "@/components/TreatmentsBrowser";
import { PRICE_DISCLAIMER } from "@/content/treatments";

export const metadata = {
  title: "Treatments & prices abroad",
  description: "Indicative prices for knee replacement, heart bypass, IVF, spinal fusion, dental implants and more across India, Turkey, Thailand, Singapore, Mexico, the UAE and Malaysia.",
};

export default async function TreatmentsPage({ searchParams }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Treatments"
        title="Treatments and what they cost abroad"
        description="Compare indicative price ranges, hospital stays and time in country for popular procedures — then get exact quotes for your case."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Treatments" }]}
      />
      <section className="container-wc py-12">
        <TreatmentsBrowser initialQuery={sp?.q || ""} initialSpecialty={sp?.specialty || ""} />
        <p className="mt-10 text-xs text-ink-400">{PRICE_DISCLAIMER}</p>
      </section>
    </>
  );
}
