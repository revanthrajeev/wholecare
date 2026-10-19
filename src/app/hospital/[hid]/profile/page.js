import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/core";
import HospitalProfileEditor from "@/components/hospital/HospitalProfileEditor";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hospital profile", robots: { index: false } };

export default async function HospitalProfilePage({ params }) {
  const { hid } = await params;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user || user.role !== "hospital" || user.hospitalId !== hid) redirect(`/login?next=/hospital/${hid}/profile`);
  const hospital = db.hospitals.find((h) => h.id === hid);
  return (
    <>
      <PageHeader eyebrow="Hospital portal" title="Your public profile" description="What patients see when they compare hospitals. Accurate, specific profiles get more qualified cases." />
      <section className="container-wc py-10">
        <HospitalProfileEditor hospital={hospital} />
      </section>
    </>
  );
}
