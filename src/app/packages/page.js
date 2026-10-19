import { PackageCheck } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/core";
import { PackageCard } from "@/components/cards";
import { getPublicPackages } from "@/lib/data";
import { treatmentBySlug } from "@/content/treatments";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "All-inclusive treatment packages",
  description: "Fixed-price packages covering surgery, hospital stay, hotel nights, transfers and follow-up — with inclusions and exclusions listed.",
};

export default function PackagesPage() {
  const packages = getPublicPackages();
  const groups = {};
  for (const p of packages) (groups[treatmentBySlug(p.treatmentSlug)?.specialty || "Other"] ||= []).push(p);
  return (
    <>
      <PageHeader eyebrow="Packages" title="Fixed-price packages, with the fine print up front" description="Surgery, stay, hotel, transfers and follow-up in one price — inclusions and exclusions listed on every package. Final terms are confirmed after your records review." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Packages" }]} />
      <section className="container-wc space-y-14 py-12">
        {packages.length === 0 && <EmptyState icon={PackageCheck} title="No packages yet" />}
        {Object.entries(groups).map(([specialty, list]) => (
          <div key={specialty}>
            <h2 className="text-xl font-bold text-ink-900">{specialty}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <PackageCard key={p.id} pkg={p} treatmentName={treatmentBySlug(p.treatmentSlug)?.name} />
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-ink-400">Packages shown are sample listings for this demonstration. A package price applies once the hospital confirms your eligibility from your reports.</p>
      </section>
    </>
  );
}
