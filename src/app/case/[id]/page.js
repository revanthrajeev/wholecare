import { notFound, redirect } from "next/navigation";
import CaseRoom from "@/components/case/CaseRoom";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase } from "@/lib/access";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case room", robots: { index: false } };

export default async function CasePage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user) redirect(`/login?next=/case/${id}`);
  const c = db.cases.find((x) => x.id === id);
  if (!c || !canViewCase(user, c)) notFound();
  if (user.role === "hospital") redirect(`/hospital/${user.hospitalId}/case/${id}`);
  return <CaseRoom caseId={id} me={{ id: user.id, role: user.role }} initialTab={typeof sp?.tab === "string" ? sp.tab : "overview"} welcome={sp?.welcome === "1"} />;
}
