import { ok, fail } from "@/lib/http";
import { readDb } from "@/lib/db";
import { getCurrentUser, isStaff, publicUser } from "@/lib/auth";
import { ratingsByHospital } from "@/lib/data";
import { CASE_STAGES } from "@/lib/constants";
import { aiProviderName } from "@/lib/ai";

const PHASES = [
  ["Intake", ["Submitted", "Under Review"]],
  ["Matching", ["Sent to Hospitals", "Quotation Received"]],
  ["Confirmed", ["Confirmed"]],
  ["In care", ["In Treatment", "Recovery"]],
  ["Completed", ["Completed"]],
];

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return fail("Not authorized.", 403);
  const db = readDb();
  const ratings = ratingsByHospital(db);
  const users = db.users || [];
  const name = (id) => users.find((u) => u.id === id)?.name || null;
  const hospitalName = (id) => db.hospitals.find((h) => h.id === id)?.name || id;

  const quotes = db.quotations;
  const decided = quotes.filter((q) => ["accepted", "declined", "not_selected"].includes(q.status));
  const firstResponseHours = db.cases
    .flatMap((c) => (c.sentToHospitals || []).map((hid) => {
      const sent = c.timeline_events.find((e) => /sent to/i.test(e.label))?.at;
      const q = quotes.filter((x) => x.caseId === c.id && x.hospitalId === hid).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      return sent && q ? (Date.parse(q.createdAt) - Date.parse(sent)) / 36e5 : null;
    }))
    .filter((x) => x != null && x >= 0);
  const byCountry = {};
  for (const c of db.cases) byCountry[c.countryOfResidence || "Unknown"] = (byCountry[c.countryOfResidence || "Unknown"] || 0) + 1;

  return ok({
    stats: {
      cases: db.cases.length,
      openCases: db.cases.filter((c) => c.stage !== "Completed").length,
      unassigned: db.cases.filter((c) => !c.coordinatorId && c.stage !== "Completed").length,
      patients: users.filter((u) => u.role === "patient").length,
      hospitals: db.hospitals.filter((h) => h.verified).length,
      pendingHospitals: db.hospitals.filter((h) => !h.verified).length,
      quotes: quotes.length,
      acceptanceRate: decided.length ? Math.round((quotes.filter((q) => q.status === "accepted").length / decided.length) * 100) : null,
      avgFirstQuoteHours: firstResponseHours.length ? Math.round(firstResponseHours.reduce((a, b) => a + b, 0) / firstResponseHours.length) : null,
      consultations: (db.consultations || []).length,
      pendingConsultations: (db.consultations || []).filter((c) => c.status === "requested").length,
      newInquiries: (db.inquiries || []).filter((i) => i.status === "new").length,
      aiProvider: aiProviderName(),
      assistantChats: (db.assistantLog || []).length,
      assistantByProvider: (db.assistantLog || []).reduce((acc, l) => ({ ...acc, [l.provider]: (acc[l.provider] || 0) + 1 }), {}),
    },
    funnel: PHASES.map(([label, stages]) => ({ label, count: db.cases.filter((c) => stages.includes(c.stage)).length })),
    byCountry: Object.entries(byCountry).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
    stages: CASE_STAGES,
    cases: db.cases
      .map((c) => ({
        id: c.id,
        type: c.type,
        patientName: c.patientName,
        countryOfResidence: c.countryOfResidence,
        specialty: c.specialty,
        stage: c.stage,
        coordinatorId: c.coordinatorId,
        coordinator: name(c.coordinatorId),
        hospitals: (c.sentToHospitals || []).map(hospitalName),
        quotes: quotes.filter((q) => q.caseId === c.id).length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt || c.createdAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    hospitals: db.hospitals.map((h) => ({ ...h, ...(ratings[h.id] || {}), cases: db.cases.filter((c) => (c.sentToHospitals || []).includes(h.id)).length })),
    consultations: (db.consultations || []).slice().sort((a, b) => `${b.date}${b.timeSlot}`.localeCompare(`${a.date}${a.timeSlot}`)).map((c) => ({ ...c, patient: name(c.ownerId) })),
    inquiries: (db.inquiries || []).slice().reverse(),
    reviews: (db.reviews || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((r) => ({ ...r, hospital: hospitalName(r.hospitalId) })),
    staff: users.filter(isStaff).map((u) => ({ id: u.id, name: u.name, role: u.role })),
    users: users.map(publicUser).map((u) => ({ ...u, hospital: u.hospitalId ? hospitalName(u.hospitalId) : null })),
    auditLog: (db.auditLog || []).slice(-150).reverse().map((a) => ({ ...a, user: users.find((u) => u.id === a.userId)?.email || a.userId })),
  });
}
