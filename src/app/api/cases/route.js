import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb, newId } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notifyStaff, notifyHospital } from "@/lib/notify";
import { caseForHospital } from "@/lib/access";
import { treatmentBySlug } from "@/content/treatments";
import { detectSpecialty } from "@/lib/ai-rules";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  let list;
  if (isStaff(user)) list = db.cases;
  else if (user.role === "hospital") list = db.cases.filter((c) => (c.sentToHospitals || []).includes(user.hospitalId)).map((c) => caseForHospital(c, user.hospitalId));
  else list = db.cases.filter((c) => c.ownerId === user.id).map(({ hospitalNotes, staffNotes, ...c }) => c);
  return ok(list.slice().sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)));
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in to create a case.", 401);
  if (user.role !== "patient") return fail("Cases are created from a patient account.", 403);
  const body = await readJson(request);
  if (!body.consent) return fail("Please confirm you consent to sharing your information with the hospitals you choose.");
  const type = body.type === "second_opinion" ? "second_opinion" : "treatment";
  const condition = clean(body.condition, 3000);
  const patientName = clean(body.patientName, 120) || user.name || "";
  if (!condition || condition.length < 10) return fail("Please describe the condition or what you need (at least a sentence).");
  if (!patientName) return fail("Please enter the patient's name.");
  if (type === "second_opinion" && clean(body.questions, 3000).length < 10) return fail("Tell the specialist what you'd like answered.");
  const treatment = treatmentBySlug(body.treatmentSlug);
  const now = new Date().toISOString();

  const created = mutateDb((db) => {
    let hospital = null;
    if (body.hospitalSlug) hospital = db.hospitals.find((h) => (h.slug === body.hospitalSlug || h.id === body.hospitalSlug) && h.verified) || null;
    let doctor = null;
    if (body.doctorSlug) doctor = (db.doctors || []).find((d) => d.slug === body.doctorSlug) || null;
    if (doctor && !db.hospitals.find((h) => h.id === doctor.hospitalId && h.verified)) doctor = null;
    const pkg = body.packageId ? (db.packages || []).find((p) => p.id === body.packageId) : null;
    const specialty = treatment?.specialty || clean(body.specialty, 80) || detectSpecialty(`${condition} ${body.existingTreatment || ""}`) || "";
    const age = Number(body.patientAge);

    const c = {
      id: newId("case"),
      ownerId: user.id,
      type,
      patientName,
      patientAge: Number.isFinite(age) && age > 0 && age < 120 ? Math.round(age) : null,
      relationship: clean(body.relationship, 40) || "self",
      countryOfResidence: clean(body.countryOfResidence, 80),
      treatmentSlug: treatment?.slug || null,
      specialty,
      preferredDestination: clean(body.preferredDestination, 80) || "Not sure yet",
      condition,
      existingTreatment: clean(body.existingTreatment, 3000),
      questions: type === "second_opinion" ? clean(body.questions, 3000) : "",
      budgetRange: clean(body.budgetRange, 80),
      timeline: clean(body.timeline, 80),
      packageId: pkg?.id || null,
      stage: type === "second_opinion" ? "Under Review" : "Submitted",
      sentToHospitals: [],
      hospitalStatus: {},
      coordinatorId: null,
      consentGivenAt: now,
      createdAt: now,
      updatedAt: now,
      timeline_events: [{ label: type === "second_opinion" ? "Second-opinion request submitted" : "Case submitted", at: now, kind: "patient" }],
      messages: [],
      travel: { arrivalDate: "", flightNumber: "", departureDate: "", companions: 0, accommodation: "", airportPickup: true, interpreterLanguage: "", notes: "" },
      visaLetter: { status: "none" },
      recovery: { plan: [], checkins: [] },
      share: { enabled: false, token: null },
    };

    const target = doctor ? db.hospitals.find((h) => h.id === doctor.hospitalId) : hospital;
    if (type === "second_opinion") {
      c.secondOpinion = { doctorId: doctor?.id || null, hospitalId: target?.id || null, status: doctor ? "in_review" : "awaiting_assignment", requestedAt: now, dueBy: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10) };
    }
    if (target) {
      c.sentToHospitals = [target.id];
      c.hospitalStatus[target.id] = { status: "new" };
      if (type === "treatment") c.stage = "Sent to Hospitals";
      c.timeline_events.push({ label: `${type === "second_opinion" ? "Request" : "Case"} sent to ${target.name}`, at: now, kind: "patient" });
      notifyHospital(db, target.id, { message: `${type === "second_opinion" ? "Second opinion requested" : "New case"}: ${patientName}${specialty ? ` (${specialty})` : ""}`, link: `/hospital/${target.id}/case/${c.id}` });
      recordAudit(db, { userId: user.id, action: "case.sent_to_hospitals", targetId: c.id });
    }
    db.cases.push(c);
    recordAudit(db, { userId: user.id, action: "case.created", targetId: c.id });
    notifyStaff(db, { message: `New ${type === "second_opinion" ? "second-opinion request" : "case"}: ${patientName}${specialty ? ` — ${specialty}` : ""}`, link: `/case/${c.id}` });
    return c;
  });

  return ok(created, 201);
}
