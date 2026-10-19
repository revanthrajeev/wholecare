import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb, newId, randomToken } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notify, notifyStaff } from "@/lib/notify";
import { isBookable } from "@/lib/schedule";
import { destinationByCountry } from "@/content/destinations";

const ACTIVE = ["requested", "confirmed"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  const all = db.consultations || [];
  const mine = isStaff(user) ? all : user.role === "hospital" ? all.filter((c) => c.hospitalId === user.hospitalId) : all.filter((c) => c.ownerId === user.id);
  return ok(mine.slice().sort((a, b) => `${a.date}${a.timeSlot}`.localeCompare(`${b.date}${b.timeSlot}`)));
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in to book a consultation.", 401);
  if (user.role !== "patient") return fail("Consultations are booked from a patient account.", 403);
  const body = await readJson(request);

  const result = mutateDb((db) => {
    const doctor = (db.doctors || []).find((d) => d.id === body.doctorId);
    const hospital = doctor && db.hospitals.find((h) => h.id === doctor.hospitalId);
    if (!doctor || !hospital?.verified) return { error: "Doctor not found.", status: 404 };
    const booked = (db.consultations || []).filter((c) => c.doctorId === doctor.id && ACTIVE.includes(c.status));
    if (!isBookable(doctor, body.date, body.timeSlot, booked)) return { error: "That slot is no longer available — please pick another time.", status: 409 };
    let caseId = null;
    if (body.caseId) {
      const c = db.cases.find((x) => x.id === body.caseId && x.ownerId === user.id);
      if (!c) return { error: "Case not found.", status: 404 };
      caseId = c.id;
    }
    const dest = destinationByCountry(hospital.country);
    const consultation = {
      id: newId("consult"),
      ownerId: user.id,
      caseId,
      doctorId: doctor.id,
      hospitalId: hospital.id,
      doctorName: doctor.name,
      hospitalName: hospital.name,
      specialty: doctor.specialty,
      date: body.date,
      timeSlot: body.timeSlot,
      timezone: dest?.timezone || "",
      timeZone: dest?.timeZone || null,
      reason: clean(body.reason, 600),
      status: "requested",
      feeUSD: doctor.consultFeeUSD,
      roomId: `wholecare-${randomToken(12).replace(/[^a-zA-Z0-9]/g, "")}`,
      createdAt: new Date().toISOString(),
    };
    db.consultations = db.consultations || [];
    db.consultations.push(consultation);
    if (caseId) {
      const c = db.cases.find((x) => x.id === caseId);
      c.timeline_events.push({ label: `Video consult requested with ${doctor.name}`, at: consultation.createdAt, kind: "patient" });
    }
    const hospitalUser = db.users.find((u) => u.role === "hospital" && u.hospitalId === hospital.id);
    if (hospitalUser) notify(db, { userId: hospitalUser.id, message: `Consultation request: ${user.name || user.email} with ${doctor.name} on ${body.date} ${body.timeSlot}`, link: `/hospital/${hospital.id}?tab=consultations` });
    notifyStaff(db, { message: `New consultation request with ${doctor.name}`, link: "/admin?tab=consultations" });
    recordAudit(db, { userId: user.id, action: "consultation.requested", targetId: consultation.id });
    return { consultation };
  });

  if (result.error) return fail(result.error, result.status);
  return ok(result.consultation, 201);
}
