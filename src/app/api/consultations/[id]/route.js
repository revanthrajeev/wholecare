import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { canSeeConsultation } from "@/lib/access";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const c = (readDb().consultations || []).find((x) => x.id === id);
  if (!c || !canSeeConsultation(user, c)) return fail("Consultation not found.", 404);
  return ok(c);
}

const HOSPITAL_ACTIONS = { confirm: "confirmed", decline: "declined", complete: "completed" };

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);
  const result = mutateDb((db) => {
    const c = (db.consultations || []).find((x) => x.id === id);
    if (!c || !canSeeConsultation(user, c)) return { error: "Consultation not found.", status: 404 };
    const now = new Date().toISOString();
    if (body.action === "cancel") {
      if (c.ownerId !== user.id && !isStaff(user)) return { error: "Only the patient can cancel.", status: 403 };
      if (!["requested", "confirmed"].includes(c.status)) return { error: "This consultation can't be cancelled.", status: 400 };
      c.status = "cancelled";
      c.cancelledAt = now;
      const hu = db.users.find((u) => u.role === "hospital" && u.hospitalId === c.hospitalId);
      if (hu) notify(db, { userId: hu.id, message: `Consultation cancelled: ${c.doctorName}, ${c.date} ${c.timeSlot}`, link: `/hospital/${c.hospitalId}?tab=consultations` });
    } else if (HOSPITAL_ACTIONS[body.action]) {
      if (!(isStaff(user) || (user.role === "hospital" && user.hospitalId === c.hospitalId))) return { error: "Not allowed.", status: 403 };
      if (body.action === "confirm" && c.status !== "requested") return { error: "Only requested consultations can be confirmed.", status: 400 };
      c.status = HOSPITAL_ACTIONS[body.action];
      c[`${c.status}At`] = now;
      if (body.notes) c.doctorNotes = clean(body.notes, 2000);
      const verb = { confirmed: "confirmed", declined: "declined", completed: "marked complete" }[c.status];
      notify(db, { userId: c.ownerId, message: `Your consultation with ${c.doctorName} on ${c.date} ${c.timeSlot} was ${verb}`, link: c.status === "confirmed" ? `/consultations/${c.id}` : "/dashboard" });
      if (c.caseId) {
        const kase = db.cases.find((x) => x.id === c.caseId);
        kase?.timeline_events.push({ label: `Video consult with ${c.doctorName} ${verb}`, at: now, kind: "hospital" });
      }
    } else {
      return { error: "Unknown action.", status: 400 };
    }
    recordAudit(db, { userId: user.id, action: `consultation.${body.action}`, targetId: c.id });
    return { consultation: c };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.consultation);
}
