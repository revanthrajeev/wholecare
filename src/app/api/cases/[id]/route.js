import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb, newId, randomToken } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { canViewCase, isOwner, caseForViewer } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { notify, notifyHospital, notifyStaff } from "@/lib/notify";
import { ratingsByHospital, pickHospital } from "@/lib/data";
import { CASE_STAGES, HOSPITAL_PIPELINE, HOSPITAL_UPDATES } from "@/lib/constants";
import { treatmentBySlug } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";

function recommendedFor(db, c) {
  const ratings = ratingsByHospital(db);
  const destCountry = DESTINATIONS.find((d) => (c.preferredDestination || "").toLowerCase().includes(d.country.toLowerCase()))?.country;
  return db.hospitals
    .filter((h) => h.verified && !(c.sentToHospitals || []).includes(h.id))
    .map((h) => {
      let score = 0;
      const reasons = [];
      if (c.specialty && !h.specialties.includes(c.specialty)) return null;
      if (c.specialty) {
        score += 50;
        reasons.push(`Offers ${c.specialty}`);
      }
      if (destCountry && h.country === destCountry) {
        score += 25;
        reasons.push(`In ${h.country}`);
      }
      const r = ratings[h.id];
      if (r) score += r.rating * 4;
      if (h.responseHours && h.responseHours <= 12) {
        score += 6;
        reasons.push("Fast replies");
      }
      return { hospital: { ...pickHospital({ ...h, ...(r || {}) }), responseHours: h.responseHours, specialties: h.specialties }, score, reasons };
    })
    .filter((x) => x && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c || !canViewCase(user, c)) return fail("Case not found.", 404);
  const viewer = isStaff(user) ? "staff" : user.role === "hospital" ? "hospital" : "patient";
  if (viewer !== "patient") mutateDb((d) => recordAudit(d, { userId: user.id, action: "case.viewed", targetId: c.id }));

  const ratings = ratingsByHospital(db);
  const hospitalIds = new Set([...(c.sentToHospitals || [])]);
  const quotations = db.quotations.filter((q) => q.caseId === c.id && (viewer !== "hospital" || q.hospitalId === user.hospitalId));
  quotations.forEach((q) => hospitalIds.add(q.hospitalId));
  const hospitals = Object.fromEntries([...hospitalIds].map((hid) => [hid, db.hospitals.find((h) => h.id === hid)]).filter(([, h]) => h).map(([hid, h]) => [hid, { ...pickHospital({ ...h, ...(ratings[hid] || {}) }), contactEmail: h.contactEmail }]));
  const coordinator = c.coordinatorId ? db.users.find((u) => u.id === c.coordinatorId) : null;
  const doctorId = c.secondOpinion?.doctorId;
  const doctor = doctorId ? (db.doctors || []).find((d) => d.id === doctorId) : null;

  return ok({
    viewer,
    case: caseForViewer(user, c),
    quotations: quotations.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    hospitals,
    recommended: viewer === "patient" || viewer === "staff" ? recommendedFor(db, c) : [],
    files: (db.files || []).filter((f) => f.caseId === c.id).map(({ storedAs, ...f }) => f),
    consultations: (db.consultations || []).filter((x) => x.caseId === c.id && (viewer !== "hospital" || x.hospitalId === user.hospitalId)),
    coordinator: coordinator ? { name: coordinator.name, email: coordinator.email, phone: coordinator.phone || null } : null,
    doctor: doctor ? { id: doctor.id, slug: doctor.slug, name: doctor.name, title: doctor.title, specialty: doctor.specialty, image: doctor.image } : null,
    staff: viewer === "staff" ? db.users.filter((u) => isStaff(u)).map((u) => ({ id: u.id, name: u.name, role: u.role })) : undefined,
    doctors: viewer === "hospital" ? (db.doctors || []).filter((d) => d.hospitalId === user.hospitalId).map(({ id, name, specialty }) => ({ id, name, specialty })) : undefined,
    specialists: viewer === "staff" && c.type === "second_opinion" ? (db.doctors || []).filter((d) => (!c.specialty || d.specialty === c.specialty) && db.hospitals.find((h) => h.id === d.hospitalId)?.verified).map((d) => ({ id: d.id, name: d.name, specialty: d.specialty, hospitalId: d.hospitalId })) : undefined,
    stages: CASE_STAGES,
    pipeline: HOSPITAL_PIPELINE,
  });
}

const TRAVEL_FIELDS = ["arrivalDate", "departureDate", "flightNumber", "accommodation", "interpreterLanguage", "notes"];

function defaultRecoveryPlan(c, now) {
  const t = treatmentBySlug(c.treatmentSlug);
  const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const base = [
    { title: "Wound check with your surgeon (video)", due: day(7) },
    { title: "Share discharge summary with your local doctor", due: day(3) },
    { title: "Follow-up video consult", due: day(42) },
  ];
  if (t?.specialty === "Orthopedics" || t?.specialty === "Spine Surgery") base.splice(1, 0, { title: "Physiotherapy sessions as prescribed", due: day(28) });
  if (t?.specialty === "Bariatric Surgery") base.splice(1, 0, { title: "Dietitian check-in (video)", due: day(14) });
  return base.map((x) => ({ id: newId("task"), ...x, done: false, createdAt: now }));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);
  const action = body.action;

  const result = mutateDb((db) => {
    const c = db.cases.find((x) => x.id === id);
    if (!c || !canViewCase(user, c)) return { error: "Case not found.", status: 404 };
    const staff = isStaff(user);
    const owner = isOwner(user, c);
    const hosp = user.role === "hospital" ? user.hospitalId : null;
    const accepted = c.acceptedQuoteId ? db.quotations.find((q) => q.id === c.acceptedQuoteId) : null;
    const treatingHospital = accepted?.hospitalId || c.secondOpinion?.hospitalId || null;
    const now = new Date().toISOString();
    const event = (label, kind) => c.timeline_events.push({ label, at: now, kind });
    const deny = () => ({ error: "You can't do that on this case.", status: 403 });
    const idx = CASE_STAGES.indexOf(c.stage);

    switch (action) {
      case "send": {
        if (!owner && !staff) return deny();
        const ids = (body.hospitalIds || []).filter((hid) => db.hospitals.some((h) => h.id === hid && h.verified) && !c.sentToHospitals.includes(hid));
        if (!ids.length) return { error: "Choose at least one verified hospital.", status: 400 };
        c.sentToHospitals.push(...ids);
        c.hospitalStatus = c.hospitalStatus || {};
        ids.forEach((hid) => {
          c.hospitalStatus[hid] = { status: "new" };
          notifyHospital(db, hid, { message: `New case: ${c.patientName}${c.specialty ? ` (${c.specialty})` : ""}`, link: `/hospital/${hid}/case/${c.id}` });
        });
        if (idx < CASE_STAGES.indexOf("Sent to Hospitals")) c.stage = "Sent to Hospitals";
        event(`Case sent to ${ids.length} hospital${ids.length > 1 ? "s" : ""}`, owner ? "patient" : "coordinator");
        recordAudit(db, { userId: user.id, action: "case.sent_to_hospitals", targetId: c.id });
        break;
      }
      case "details": {
        if (!owner && !staff) return deny();
        if (idx >= CASE_STAGES.indexOf("Confirmed") && !staff) return { error: "Details are locked once a quote is accepted — message your hospital instead.", status: 400 };
        for (const k of ["condition", "existingTreatment", "budgetRange", "timeline", "countryOfResidence", "preferredDestination"]) if (typeof body[k] === "string") c[k] = clean(body[k], 3000);
        if (body.patientAge) c.patientAge = Math.max(0, Math.min(120, Math.round(Number(body.patientAge)) || 0)) || c.patientAge;
        event("Case details updated", owner ? "patient" : "coordinator");
        break;
      }
      case "travel": {
        if (!owner && !staff && hosp !== treatingHospital) return deny();
        c.travel = c.travel || {};
        for (const k of TRAVEL_FIELDS) if (typeof body.travel?.[k] === "string") c.travel[k] = clean(body.travel[k], 300);
        if (body.travel?.companions != null) c.travel.companions = Math.max(0, Math.min(6, Number(body.travel.companions) || 0));
        if (typeof body.travel?.airportPickup === "boolean") c.travel.airportPickup = body.travel.airportPickup;
        if (treatingHospital) notifyHospital(db, treatingHospital, { message: `Travel details updated for ${c.patientName}`, link: `/hospital/${treatingHospital}/case/${c.id}` });
        break;
      }
      case "requestVisaLetter": {
        if (!owner && !staff) return deny();
        if (!accepted) return { error: "Accept a quote first — the treating hospital issues the letter.", status: 400 };
        if (c.visaLetter?.status === "issued") return { error: "Your visa letter has already been issued.", status: 400 };
        c.visaLetter = { status: "requested", requestedAt: now, hospitalId: accepted.hospitalId };
        event("Visa invitation letter requested", "patient");
        notifyHospital(db, accepted.hospitalId, { message: `Visa letter requested: ${c.patientName}`, link: `/hospital/${accepted.hospitalId}/case/${c.id}` });
        break;
      }
      case "issueVisaLetter": {
        if (!staff && !(hosp && hosp === treatingHospital)) return deny();
        const h = db.hospitals.find((x) => x.id === (treatingHospital || hosp));
        const initials = (h?.name || "WC").split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 4);
        c.visaLetter = { ...(c.visaLetter || {}), status: "issued", issuedAt: now, issuedBy: h?.id, refNo: `${initials}/IPD/${now.slice(0, 4)}/${randomToken(3).toUpperCase().replace(/[^A-Z0-9]/g, "X")}`, companions: clean(body.companions || "", 300) };
        event("Visa invitation letter issued", "hospital");
        notify(db, { userId: c.ownerId, message: `${h?.name || "Your hospital"} issued your visa invitation letter`, link: `/case/${c.id}?tab=travel` });
        break;
      }
      case "share": {
        if (!owner) return deny();
        c.share = c.share || {};
        c.share.enabled = Boolean(body.enabled);
        if (c.share.enabled && (!c.share.token || body.regenerate)) c.share.token = `fam-${randomToken(9).replace(/[^a-zA-Z0-9]/g, "")}`;
        c.share.updatedAt = now;
        recordAudit(db, { userId: user.id, action: c.share.enabled ? "share.enabled" : "share.disabled", targetId: c.id });
        break;
      }
      case "checkin": {
        if (!owner) return deny();
        const pain = Math.max(0, Math.min(10, Math.round(Number(body.pain))));
        const mobility = Math.max(0, Math.min(10, Math.round(Number(body.mobility))));
        if (!Number.isFinite(pain) || !Number.isFinite(mobility)) return { error: "Pain and mobility scores are required.", status: 400 };
        const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || "") ? body.date : now.slice(0, 10);
        c.recovery = c.recovery || { plan: [], checkins: [] };
        c.recovery.checkins = c.recovery.checkins.filter((x) => x.date !== date);
        c.recovery.checkins.push({ date, pain, mobility, note: clean(body.note, 400) });
        c.recovery.checkins.sort((a, b) => a.date.localeCompare(b.date));
        if (pain >= 8 && treatingHospital) notifyHospital(db, treatingHospital, { message: `High pain score (${pain}/10) logged by ${c.patientName}`, link: `/hospital/${treatingHospital}/case/${c.id}` });
        break;
      }
      case "task": {
        c.recovery = c.recovery || { plan: [], checkins: [] };
        if (body.add) {
          if (!staff && !(hosp && hosp === treatingHospital)) return deny();
          const title = clean(body.add.title, 160);
          if (!title) return { error: "Task title required.", status: 400 };
          c.recovery.plan.push({ id: newId("task"), title, due: /^\d{4}-\d{2}-\d{2}$/.test(body.add.due || "") ? body.add.due : null, done: false, createdAt: now });
          notify(db, { userId: c.ownerId, message: `New recovery task: ${title}`, link: `/case/${c.id}?tab=recovery` });
        } else {
          if (!owner && !staff && !(hosp && hosp === treatingHospital)) return deny();
          const t = c.recovery.plan.find((x) => x.id === body.taskId);
          if (!t) return { error: "Task not found.", status: 404 };
          t.done = Boolean(body.done);
          t.doneAt = t.done ? now : null;
        }
        break;
      }
      case "hospitalStatus": {
        if (!hosp && !staff) return deny();
        const hid = hosp || body.hospitalId;
        if (!HOSPITAL_PIPELINE.some((p) => p.id === body.status) || !c.sentToHospitals.includes(hid)) return { error: "Invalid status.", status: 400 };
        c.hospitalStatus = c.hospitalStatus || {};
        c.hospitalStatus[hid] = { status: body.status, at: now };
        if (body.status === "reviewing" && c.stage === "Sent to Hospitals") event(`${db.hospitals.find((h) => h.id === hid)?.name} is reviewing the case`, "hospital");
        break;
      }
      case "milestone": {
        const u = HOSPITAL_UPDATES.find((x) => x.id === body.update);
        if (!u) return { error: "Unknown update.", status: 400 };
        if (!staff && !(hosp && hosp === treatingHospital)) return deny();
        const note = clean(body.note, 300);
        event(`${u.label}${note ? ` — ${note}` : ""}`, "hospital");
        c.stage = u.stage;
        c.hospitalStatus = c.hospitalStatus || {};
        if (treatingHospital) c.hospitalStatus[treatingHospital] = { status: u.id === "discharged" ? "discharged" : "in_treatment", at: now };
        if (u.id === "discharged" && !(c.recovery?.plan?.length)) c.recovery = { ...(c.recovery || { checkins: [] }), plan: defaultRecoveryPlan(c, now) };
        notify(db, { userId: c.ownerId, message: `Update from your hospital: ${u.label}`, link: `/case/${c.id}` });
        break;
      }
      case "complete": {
        if (!staff && !(hosp && hosp === treatingHospital)) return deny();
        c.stage = "Completed";
        event("Case completed", staff ? "coordinator" : "hospital");
        notify(db, { userId: c.ownerId, message: "Your case is complete — would you share a review to help other patients?", link: `/case/${c.id}` });
        break;
      }
      case "note": {
        const text = clean(body.text, 1500);
        if (!text) return { error: "Note text required.", status: 400 };
        if (staff) (c.staffNotes ||= []).push({ id: newId("note"), by: user.name, text, at: now });
        else if (hosp) (c.hospitalNotes ||= []).push({ id: newId("note"), hospitalId: hosp, by: user.name, text, at: now });
        else return deny();
        break;
      }
      case "assignCoordinator": {
        if (!staff) return deny();
        const co = db.users.find((u) => u.id === body.coordinatorId && isStaff(u));
        if (!co) return { error: "Coordinator not found.", status: 404 };
        c.coordinatorId = co.id;
        event(`Coordinator ${co.name} assigned`, "coordinator");
        notify(db, { userId: c.ownerId, message: `${co.name} is your Whole Care coordinator`, link: `/case/${c.id}` });
        if (co.id !== user.id) notify(db, { userId: co.id, message: `You were assigned the case of ${c.patientName}`, link: `/case/${c.id}` });
        break;
      }
      case "stage": {
        if (!staff) return deny();
        if (!CASE_STAGES.includes(body.stage)) return { error: "Unknown stage.", status: 400 };
        c.stage = body.stage;
        event(`Stage set to ${body.stage}`, "coordinator");
        notify(db, { userId: c.ownerId, message: `Your case moved to: ${body.stage}`, link: `/case/${c.id}` });
        break;
      }
      case "assignSpecialist": {
        if (!staff || c.type !== "second_opinion") return deny();
        const d = (db.doctors || []).find((x) => x.id === body.doctorId);
        if (!d) return { error: "Specialist not found.", status: 404 };
        c.secondOpinion = { ...(c.secondOpinion || {}), doctorId: d.id, hospitalId: d.hospitalId, status: "in_review" };
        if (!c.sentToHospitals.includes(d.hospitalId)) c.sentToHospitals.push(d.hospitalId);
        (c.hospitalStatus ||= {})[d.hospitalId] = { status: "reviewing", at: now };
        event(`Assigned to ${d.name} (${d.specialty})`, "coordinator");
        notifyHospital(db, d.hospitalId, { message: `Second opinion assigned to ${d.name}: ${c.patientName}`, link: `/hospital/${d.hospitalId}/case/${c.id}` });
        break;
      }
      case "secondOpinion": {
        if (c.type !== "second_opinion") return { error: "Not a second-opinion request.", status: 400 };
        if (!staff && !(hosp && hosp === c.secondOpinion?.hospitalId)) return deny();
        const summary = clean(body.summary, 6000);
        if (summary.length < 40) return { error: "Please write a fuller opinion (at least a few sentences).", status: 400 };
        const doc = (db.doctors || []).find((x) => x.id === c.secondOpinion?.doctorId);
        c.secondOpinion = { ...c.secondOpinion, status: "delivered", summary, recommendations: clean(body.recommendations, 3000), deliveredAt: now, deliveredBy: doc?.name || user.name };
        c.stage = "Completed";
        if (hosp) (c.hospitalStatus ||= {})[hosp] = { status: "discharged", at: now };
        event(`Written opinion delivered by ${doc?.name || user.name}`, "hospital");
        notify(db, { userId: c.ownerId, message: "Your written second opinion is ready", link: `/case/${c.id}?tab=opinion` });
        notifyStaff(db, { message: `Second opinion delivered for ${c.patientName}`, link: `/case/${c.id}` });
        break;
      }
      default:
        return { error: "Unknown action.", status: 400 };
    }
    c.updatedAt = now;
    return { case: caseForViewer(user, c) };
  });

  if (result.error) return fail(result.error, result.status);
  return ok(result.case);
}
