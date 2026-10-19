import { redirect } from "next/navigation";
import AdminConsole from "@/components/admin/AdminConsole";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operations console", robots: { index: false } };

export default async function AdminPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStaff(user)) redirect(user.role === "hospital" ? `/hospital/${user.hospitalId}` : "/dashboard");
  return <AdminConsole me={{ id: user.id, name: user.name, role: user.role }} initialTab={typeof sp?.tab === "string" ? sp.tab : "overview"} />;
}
