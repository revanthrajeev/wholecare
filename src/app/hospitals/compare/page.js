import Link from "next/link";
import { Check, Minus, Scale } from "lucide-react";
import { PageHeader, Button, EmptyState, HospitalCover, RatingPill, formatDate } from "@/components/ui/core";
import { Price } from "@/components/ui/client";
import { readDb } from "@/lib/db";
import { getPublicHospitals, getPublicPackages } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare hospitals" };

export default async function CompareHospitals({ searchParams }) {
  const sp = await searchParams;
  const db = readDb();
  const all = getPublicHospitals(db);
  const ids = String(sp?.ids || "").split(",").filter(Boolean).slice(0, 3);
  const hospitals = ids.map((id) => all.find((h) => h.slug === id)).filter(Boolean);
  const packages = getPublicPackages(db);
  const allSpecialties = [...new Set(hospitals.flatMap((h) => h.specialties))].sort();
  const allServices = [...new Set(hospitals.flatMap((h) => h.services))].sort();

  const rows = [
    ["Location", (h) => `${h.city}, ${h.country}`],
    ["Accreditation", (h) => h.accreditations.join(" · ")],
    ["Last verified", (h) => formatDate(h.lastVerified)],
    ["Rating", (h) => <RatingPill rating={h.rating} count={h.reviewCount} />],
    ["Typical reply time", (h) => (h.responseHours ? `~${h.responseHours} hours` : "—")],
    ["Beds", (h) => h.beds],
    ["Established", (h) => h.established],
    ["Languages", (h) => h.languages.join(", ")],
    ["Listed doctors", (h) => h.doctorCount],
    [
      "Packages",
      (h) => {
        const ps = packages.filter((p) => p.hospitalId === h.id);
        return ps.length ? (
          <span>
            {ps.length} from <Price usd={Math.min(...ps.map((p) => p.priceUSD))} />
          </span>
        ) : (
          "—"
        );
      },
    ],
  ];

  return (
    <>
      <PageHeader eyebrow="Compare" title="Compare hospitals side by side" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hospitals", href: "/hospitals" }, { label: "Compare" }]} />
      <section className="container-wc py-12">
        {hospitals.length < 2 ? (
          <EmptyState icon={Scale} title="Pick at least two hospitals to compare" action={<Button href="/hospitals">Browse hospitals</Button>}>
            Tick &ldquo;Compare&rdquo; on up to three hospitals in the directory.
          </EmptyState>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="w-48 p-5 text-left align-bottom text-xs font-semibold uppercase tracking-wider text-ink-400">Hospital</th>
                  {hospitals.map((h) => (
                    <th key={h.id} className="p-5 text-left align-top">
                      <HospitalCover hospital={h} className="mb-3 h-28 w-full rounded-2xl" />
                      <Link href={`/hospitals/${h.slug}`} className="font-display text-base font-bold text-ink-900 hover:text-brand-700">
                        {h.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, fn]) => (
                  <tr key={label} className="border-b border-line">
                    <th scope="row" className="bg-ink-50/60 p-4 text-left font-semibold text-ink-600">
                      {label}
                    </th>
                    {hospitals.map((h) => (
                      <td key={h.id} className="p-4 text-ink-800">
                        {fn(h)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <th scope="row" colSpan={hospitals.length + 1} className="bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                    Specialties
                  </th>
                </tr>
                {allSpecialties.map((s) => (
                  <tr key={s} className="border-b border-line">
                    <th scope="row" className="p-4 text-left font-medium text-ink-600">
                      {s}
                    </th>
                    {hospitals.map((h) => (
                      <td key={h.id} className="p-4">
                        {h.specialties.includes(s) ? <Check size={18} className="text-ok-600" aria-label="Offered" /> : <Minus size={18} className="text-ink-300" aria-label="Not offered" />}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-line">
                  <th scope="row" colSpan={hospitals.length + 1} className="bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                    International patient services
                  </th>
                </tr>
                {allServices.map((s) => (
                  <tr key={s} className="border-b border-line last:border-0">
                    <th scope="row" className="p-4 text-left font-medium text-ink-600">
                      {s}
                    </th>
                    {hospitals.map((h) => (
                      <td key={h.id} className="p-4">
                        {h.services.includes(s) ? <Check size={18} className="text-ok-600" aria-label="Available" /> : <Minus size={18} className="text-ink-300" aria-label="Not listed" />}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4" />
                  {hospitals.map((h) => (
                    <td key={h.id} className="p-4">
                      <Button href={`/get-quote?hospital=${h.slug}`} size="sm">
                        Request quote
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
