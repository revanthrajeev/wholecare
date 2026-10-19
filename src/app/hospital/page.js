import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HospitalEntry() {
  const user = await getCurrentUser();
  if (user?.role === "hospital") redirect(`/hospital/${user.hospitalId}`);
  if (isStaff(user)) redirect("/admin?tab=hospitals");
  redirect("/login?next=/hospital");
}
