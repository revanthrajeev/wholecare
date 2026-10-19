import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { readDb } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { canSeeConsultation } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { mutateDb } from "@/lib/db";
import ConsultRoom from "@/components/ConsultRoom";

export const dynamic = "force-dynamic";
export const metadata = { title: "Video consultation", robots: { index: false } };

export default async function ConsultationPage({ params }) {
  const { id } = await params;
  const db = readDb();
  const user = await getCurrentUser(db);
  if (!user) redirect(`/login?next=/consultations/${id}`);
  const c = (db.consultations || []).find((x) => x.id === id);
  if (!c || !canSeeConsultation(user, c)) notFound();
  mutateDb((d) => recordAudit(d, { userId: user.id, action: "consultation.viewed", targetId: c.id }));
  const viewer = isStaff(user) ? "staff" : user.role === "hospital" ? "hospital" : "patient";
  const back = viewer === "hospital" ? `/hospital/${user.hospitalId}?tab=consultations` : viewer === "staff" ? "/admin?tab=consultations" : "/dashboard";
  const kase = c.caseId ? db.cases.find((x) => x.id === c.caseId) : null;

  return (
    <section className="hero-night min-h-screen pb-16 pt-28">
      <div className="container-wc">
        <Link href={back} className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white">
          <ArrowLeft size={16} aria-hidden /> Back
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">Video consultation</h1>
        {kase && (
          <p className="mt-2 text-ink-300">
            Linked case: {kase.patientName} — {kase.condition.slice(0, 90)}
            {kase.condition.length > 90 ? "…" : ""}
          </p>
        )}
        <div className="mt-8">
          <ConsultRoom consultation={c} viewer={viewer} displayName={viewer === "patient" ? user.name || "Patient" : `${c.doctorName} (${c.hospitalName})`} />
        </div>
      </div>
    </section>
  );
}
