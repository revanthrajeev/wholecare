import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb, randomToken } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { canViewCase, isOwner } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { notifyHospital } from "@/lib/notify";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const db = readDb();
  const q = db.quotations.find((x) => x.id === id);
  const c = q && db.cases.find((x) => x.id === q.caseId);
  if (!q || !canViewCase(user, c) || (user.role === "hospital" && q.hospitalId !== user.hospitalId)) return fail("Quotation not found.", 404);
  return ok(q);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);

  const result = mutateDb((db) => {
    const q = db.quotations.find((x) => x.id === id);
    const c = q && db.cases.find((x) => x.id === q.caseId);
    if (!q || !canViewCase(user, c)) return { error: "Quotation not found.", status: 404 };
    const now = new Date().toISOString();
    const hospital = db.hospitals.find((h) => h.id === q.hospitalId);

    if (body.action === "accept") {
      if (!isOwner(user, c) && !isStaff(user)) return { error: "Only the patient can accept a quote.", status: 403 };
      if (q.status !== "submitted") return { error: "This quote can no longer be accepted.", status: 400 };
      if (c.acceptedQuoteId) return { error: "You've already accepted a quote for this case.", status: 409 };
      const expires = new Date(Date.parse(q.createdAt) + q.validityDays * 864e5);
      if (expires < new Date()) {
        q.status = "expired";
        return { error: "This quote has expired — ask the hospital for an updated one.", status: 400 };
      }
      q.status = "accepted";
      q.acceptedAt = now;
      q.lockCode = `WC-LOCK-${randomToken(4).toUpperCase().replace(/[^A-Z0-9]/g, "7").slice(0, 5)}`;
      q.lockedUntil = expires.toISOString().slice(0, 10);
      c.acceptedQuoteId = q.id;
      c.stage = "Confirmed";
      c.hospitalStatus = c.hospitalStatus || {};
      c.hospitalStatus[q.hospitalId] = { status: "accepted", at: now };
      for (const other of db.quotations.filter((x) => x.caseId === c.id && x.id !== q.id && x.status === "submitted")) {
        other.status = "not_selected";
        c.hospitalStatus[other.hospitalId] = { status: "lost", at: now };
        notifyHospital(db, other.hospitalId, { message: `${c.patientName} chose another hospital`, link: `/hospital/${other.hospitalId}/case/${c.id}` });
      }
      c.timeline_events.push({ label: `Quote accepted — price locked at $${q.totalUSD.toLocaleString("en-US")} with ${hospital?.name}`, at: now, kind: "patient" });
      notifyHospital(db, q.hospitalId, { message: `Quote accepted by ${c.patientName} (${q.lockCode})`, link: `/hospital/${q.hospitalId}/case/${c.id}` });
      recordAudit(db, { userId: user.id, action: "quotation.accepted", targetId: q.id });
    } else if (body.action === "decline") {
      if (!isOwner(user, c) && !isStaff(user)) return { error: "Only the patient can decline a quote.", status: 403 };
      if (q.status !== "submitted") return { error: "This quote is no longer open.", status: 400 };
      q.status = "declined";
      q.declinedAt = now;
      q.declineReason = clean(body.reason, 300);
      (c.hospitalStatus ||= {})[q.hospitalId] = { status: "lost", at: now };
      c.timeline_events.push({ label: `Quote from ${hospital?.name} declined`, at: now, kind: "patient" });
      notifyHospital(db, q.hospitalId, { message: `${c.patientName} declined your quote${q.declineReason ? `: “${q.declineReason}”` : ""}`, link: `/hospital/${q.hospitalId}/case/${c.id}` });
      recordAudit(db, { userId: user.id, action: "quotation.declined", targetId: q.id });
    } else if (body.action === "withdraw") {
      if (!(user.role === "hospital" && user.hospitalId === q.hospitalId) && !isStaff(user)) return { error: "Not allowed.", status: 403 };
      if (q.status !== "submitted") return { error: "Only open quotes can be withdrawn.", status: 400 };
      q.status = "withdrawn";
      c.timeline_events.push({ label: `${hospital?.name} withdrew its quote`, at: now, kind: "hospital" });
    } else {
      return { error: "Unknown action.", status: 400 };
    }
    c.updatedAt = now;
    return { quotation: q };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.quotation);
}
