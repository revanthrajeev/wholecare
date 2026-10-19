import { PageHeader } from "@/components/ui/core";
import TripCalculator from "@/components/TripCalculator";
import { treatmentBySlug } from "@/content/treatments";
import { destinationByCountry } from "@/content/destinations";

export const metadata = {
  title: "True-cost calculator",
  description: "Estimate the full cost of treatment abroad — procedure, flights, hotel, food, visa and a safety buffer — in your currency, compared with self-pay prices at home.",
};

export default async function CalculatorPage({ searchParams }) {
  const sp = await searchParams;
  const t = treatmentBySlug(typeof sp?.treatment === "string" ? sp.treatment : "");
  const destination = typeof sp?.destination === "string" && destinationByCountry(sp.destination) ? sp.destination : null;
  return (
    <>
      <PageHeader
        eyebrow="True-cost calculator"
        title="What will the whole trip really cost?"
        description="Treatment, flights, stay, food, visa and a safety buffer — in your currency, next to what you'd pay at home."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cost calculator" }]}
      />
      <section className="container-wc py-10">
        <TripCalculator initialTreatment={t && !t.priceOnAssessment ? t.slug : null} initialDestination={destination} />
      </section>
    </>
  );
}
