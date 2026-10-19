import { notFound, redirect } from "next/navigation";
import HospitalCaseWorkspace from "@/components/hospital/HospitalCaseWorkspace";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case workspace", robots: { index: false } };

export default async function HospitalCasePage({ params, searchParams }) {
  const { hid, caseId } = await params;
  const sp = await searchParams;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user || user.role !== "hospital" || user.hospitalId !== hid) redirect(`/login?next=/hospital/${hid}/case/${caseId}`);
  const c = db.cases.find((x) => x.id === caseId);
  if (!c || !(c.sentToHospitals || []).includes(hid)) notFound();
  const hospital = db.hospitals.find((h) => h.id === hid);
  return <HospitalCaseWorkspace hid={hid} caseId={caseId} me={{ id: user.id }} hospitalCountry={hospital?.country} initialTab={typeof sp?.tab === "string" ? sp.tab : "case"} />;
}
