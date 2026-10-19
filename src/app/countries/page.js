import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/core";
import { Price } from "@/components/ui/client";
import { DestinationCard } from "@/components/cards";
import { getPublicHospitals } from "@/lib/data";
import { DESTINATIONS } from "@/content/destinations";
import { TREATMENTS } from "@/content/treatments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Medical travel destinations compared",
  description: "India, Turkey, Thailand, Singapore, Mexico, the UAE and Malaysia — strengths, visas, flight times, accreditation and indicative prices.",
};

export default function CountriesPage() {
  const hospitals = getPublicHospitals();
  const knee = TREATMENTS.find((t) => t.slug === "total-knee-replacement");
  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Where to go for treatment — the honest version"
        description="Each guide covers strengths and trade-offs, visa basics, flight times, accreditation bodies and indicative prices."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Destinations" }]}
        actions={
          <Button href="/countries/compare" variant="accent" size="lg">
            <Scale size={18} aria-hidden /> Compare destinations
          </Button>
        }
      />
      <section className="container-wc py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <DestinationCard key={d.slug} destination={d} from={knee.prices[d.country]?.[0]} />
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold text-ink-900">At a glance</h2>
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Destination</th>
                <th className="px-5 py-3 font-semibold">Knee replacement from</th>
                <th className="px-5 py-3 font-semibold">Strongest in</th>
                <th className="px-5 py-3 font-semibold">Visa</th>
                <th className="px-5 py-3 font-semibold">Best time</th>
                <th className="px-5 py-3 font-semibold">Verified hospitals</th>
              </tr>
            </thead>
            <tbody>
              {DESTINATIONS.map((d) => (
                <tr key={d.slug} className="border-t border-line align-top">
                  <td className="px-5 py-4">
                    <Link href={`/countries/${d.slug}`} className="inline-flex items-center gap-1 font-semibold text-ink-900 hover:text-brand-700">
                      {d.country} <ArrowRight size={14} aria-hidden />
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-semibold tabular-nums text-ink-900">{knee.prices[d.country] ? <Price usd={knee.prices[d.country][0]} /> : "—"}</td>
                  <td className="px-5 py-4 text-ink-600">{d.strengths.slice(0, 3).join(", ")}</td>
                  <td className="px-5 py-4 text-ink-600">{d.visa.type}</td>
                  <td className="px-5 py-4 text-ink-600">{d.bestTime}</td>
                  <td className="px-5 py-4 tabular-nums text-ink-900">{hospitals.filter((h) => h.country === d.country).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-400">Visa rules change frequently — always confirm on the destination&rsquo;s official government portal before booking.</p>
      </section>
    </>
  );
}
