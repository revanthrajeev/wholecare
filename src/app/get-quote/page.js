import { PageHeader } from "@/components/ui/core";
import CaseWizard from "@/components/CaseWizard";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getHospitalBySlug, getPublicPackages } from "@/lib/data";
import { treatmentBySlug } from "@/content/treatments";
import { DESTINATION_CHOICES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Get a free quote", description: "Share your reports once and receive itemized quotes from verified hospitals abroad — free for patients." };

export default async function GetQuotePage({ searchParams }) {
  const sp = await searchParams;
  const db = readDb();
  const user = await getCurrentUser(db);
  const hospital = sp?.hospital ? getHospitalBySlug(String(sp.hospital), db) : null;
  const pkg = sp?.package ? getPublicPackages(db).find((p) => p.id === sp.package) : null;
  const treatment = treatmentBySlug(sp?.treatment || pkg?.treatmentSlug);
  const destination = DESTINATION_CHOICES.includes(sp?.destination) ? sp.destination : hospital?.country || "";
  const blocked = user && user.role !== "patient";

  return (
    <>
      <PageHeader eyebrow="Free quote" title="Tell us what you need — get itemized quotes" description="Takes about three minutes. Verified hospitals review your reports and reply with line-by-line quotes you can compare." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Get a free quote" }]} />
      <section className="container-wc py-12">
        {blocked ? (
          <p className="card mx-auto max-w-xl p-8 text-center text-ink-600">You&rsquo;re signed in as a {user.role} account. Log out and use a patient account to request quotes.</p>
        ) : (
          <CaseWizard
            mode="quote"
            user={user}
            prefill={{
              treatment: treatment?.slug || "",
              destination,
              hospital: hospital ? { slug: hospital.slug, name: hospital.name } : null,
              package: pkg ? { id: pkg.id, title: pkg.title } : null,
            }}
          />
        )}
      </section>
    </>
  );
}
