import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, newId } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { CASE_STAGES } from "@/lib/constants";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "hospital" && !isStaff(user))) return fail("Only hospitals can submit quotations.", 403);
  const body = await readJson(request);
  const hospitalId = user.role === "hospital" ? user.hospitalId : body.hospitalId;

  const lineItems = (Array.isArray(body.lineItems) ? body.lineItems : [])
    .map((l) => ({ label: clean(l.label, 120), amountUSD: Math.round(Number(l.amountUSD)) }))
    .filter((l) => l.label && Number.isFinite(l.amountUSD) && l.amountUSD > 0 && l.amountUSD < 5_000_000)
    .slice(0, 25);
  if (!lineItems.length) return fail("Add at least one line item with an amount.");
  const procedure = clean(body.procedure, 160);
  if (!procedure) return fail("Procedure is required.");
  const validityDays = Math.max(7, Math.min(90, Math.round(Number(body.validityDays) || 21)));

  const result = mutateDb((db) => {
    const c = db.cases.find((x) => x.id === body.caseId);
    if (!c || !(c.sentToHospitals || []).includes(hospitalId)) return { error: "Case not found.", status: 404 };
    if (c.acceptedQuoteId) return { error: "The patient has already accepted a quote for this case.", status: 409 };
    const hospital = db.hospitals.find((h) => h.id === hospitalId);
    const doctor = body.doctorId ? (db.doctors || []).find((d) => d.id === body.doctorId && d.hospitalId === hospitalId) : null;
    const now = new Date().toISOString();
    // A new quote from the same hospital supersedes its earlier open quote.
    db.quotations.filter((q) => q.caseId === c.id && q.hospitalId === hospitalId && q.status === "submitted").forEach((q) => (q.status = "superseded"));
    const quotation = {
      id: newId("quote"),
      caseId: c.id,
      hospitalId,
      doctorId: doctor?.id || null,
      doctorName: doctor?.name || clean(body.doctorName, 120),
      procedure,
      hospitalStayDays: Math.max(0, Math.min(120, Math.round(Number(body.hospitalStayDays) || 0))),
      lineItems,
      totalUSD: lineItems.reduce((s, l) => s + l.amountUSD, 0),
      currency: "USD",
      inclusions: (Array.isArray(body.inclusions) ? body.inclusions : []).map((x) => clean(x, 120)).filter(Boolean).slice(0, 12),
      exclusions: clean(body.exclusions, 600),
      notes: clean(body.notes, 1200),
      validityDays,
      status: "submitted",
      createdAt: now,
    };
    db.quotations.push(quotation);
    if (CASE_STAGES.indexOf(c.stage) < CASE_STAGES.indexOf("Quotation Received")) c.stage = "Quotation Received";
    (c.hospitalStatus ||= {})[hospitalId] = { status: "quoted", at: now };
    c.timeline_events.push({ label: `Quotation received from ${hospital?.name}`, at: now, kind: "hospital" });
    c.updatedAt = now;
    notify(db, { userId: c.ownerId, message: `${hospital?.name} sent you a quotation`, link: `/case/${c.id}?tab=quotes` });
    if (c.coordinatorId) notify(db, { userId: c.coordinatorId, message: `Quote from ${hospital?.name} for ${c.patientName}`, link: `/case/${c.id}?tab=quotes` });
    recordAudit(db, { userId: user.id, action: "quotation.created", targetId: quotation.id });
    return { quotation };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.quotation, 201);
}
