import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notifyHospital } from "@/lib/notify";

const CHECKS = ["license", "accreditation", "intlDesk", "siteVisit"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return fail("Only admins can change verification.", 403);
  const body = await readJson(request);
  const result = mutateDb((db) => {
    const h = db.hospitals.find((x) => x.id === id);
    if (!h) return { error: "Hospital not found.", status: 404 };
    h.verification = h.verification || {};
    for (const k of CHECKS) if (typeof body.verification?.[k] === "boolean") h.verification[k] = body.verification[k];
    if (typeof body.verification?.notes === "string") h.verification.notes = clean(body.verification.notes, 600);
    if (typeof body.verified === "boolean") {
      if (body.verified && !(h.verification.license && h.verification.accreditation && h.verification.intlDesk)) {
        return { error: "Licence, accreditation and international desk checks must be complete before publishing.", status: 400 };
      }
      h.verified = body.verified;
      if (body.verified) h.lastVerified = new Date().toISOString().slice(0, 10);
      notifyHospital(db, h.id, { message: body.verified ? "Your hospital is verified — your profile is now live" : "Your hospital profile was unpublished pending re-verification", link: `/hospital/${h.id}` });
      recordAudit(db, { userId: user.id, action: body.verified ? "hospital.approved" : "hospital.unpublished", targetId: h.id });
    } else {
      recordAudit(db, { userId: user.id, action: "hospital.verification_updated", targetId: h.id });
    }
    return { hospital: h };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.hospital);
}
