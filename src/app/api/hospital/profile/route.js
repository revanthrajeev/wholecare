import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notifyStaff } from "@/lib/notify";
import { SPECIALTIES } from "@/content/specialties";

const list = (v, max, len = 80) => (Array.isArray(v) ? v : String(v || "").split("\n")).map((x) => clean(String(x), len)).filter(Boolean).slice(0, max);

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "hospital") return fail("Not authorized.", 403);
  const h = readDb().hospitals.find((x) => x.id === user.hospitalId);
  return ok(h);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "hospital") return fail("Not authorized.", 403);
  const body = await readJson(request);
  const result = mutateDb((db) => {
    const h = db.hospitals.find((x) => x.id === user.hospitalId);
    if (!h) return { error: "Hospital not found.", status: 404 };
    if (typeof body.description === "string") h.description = clean(body.description, 800);
    if (body.highlights !== undefined) h.highlights = list(body.highlights, 6, 120);
    if (body.services !== undefined) h.services = list(body.services, 14, 60);
    if (body.languages !== undefined) h.languages = list(body.languages, 14, 40);
    if (body.specialties !== undefined) {
      const s = list(body.specialties, 14).filter((x) => SPECIALTIES.some((y) => y.name === x));
      if (!s.length) return { error: "Keep at least one specialty.", status: 400 };
      h.specialties = s;
    }
    if (body.beds !== undefined) h.beds = Math.max(0, Math.round(Number(body.beds) || 0)) || null;
    if (body.established !== undefined) h.established = Math.round(Number(body.established) || 0) || null;
    if (typeof body.verificationRequest === "string" && body.verificationRequest.trim()) {
      h.verification = { ...(h.verification || {}), notes: clean(body.verificationRequest, 600), requestedAt: new Date().toISOString() };
      notifyStaff(db, { message: `${h.name} requested verification review`, link: "/admin?tab=hospitals" });
    }
    recordAudit(db, { userId: user.id, action: "hospital.profile_updated", targetId: h.id });
    return { hospital: h };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.hospital);
}
