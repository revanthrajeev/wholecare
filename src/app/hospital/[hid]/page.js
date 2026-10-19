import { redirect } from "next/navigation";
import HospitalPortal from "@/components/hospital/HospitalPortal";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hospital portal", robots: { index: false } };

export default async function HospitalDashboard({ params, searchParams }) {
  const { hid } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user || (!(user.role === "hospital" && user.hospitalId === hid) && !isStaff(user))) redirect(`/login?next=/hospital/${hid}`);
  return <HospitalPortal hid={hid} initialTab={typeof sp?.tab === "string" ? sp.tab : "pipeline"} welcome={sp?.welcome === "1"} />;
}
