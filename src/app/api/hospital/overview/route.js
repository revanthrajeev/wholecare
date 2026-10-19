import { ok, fail } from "@/lib/http";
import { readDb } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { caseForHospital } from "@/lib/access";
import { ratingsByHospital } from "@/lib/data";
import { HOSPITAL_PIPELINE } from "@/lib/constants";

export async function GET(request) {
  const user = await getCurrentUser();
  const hid = user?.role === "hospital" ? user.hospitalId : isStaff(user) ? new URL(request.url).searchParams.get("hid") : null;
  if (!hid) return fail("Not authorized.", 403);
  const db = readDb();
  const hospital = db.hospitals.find((h) => h.id === hid);
  if (!hospital) return fail("Hospital not found.", 404);

  const cases = db.cases.filter((c) => (c.sentToHospitals || []).includes(hid)).map((c) => caseForHospital(c, hid));
  const quotes = db.quotations.filter((q) => q.hospitalId === hid);
  const consultations = (db.consultations || []).filter((c) => c.hospitalId === hid).map((c) => ({ ...c, patient: db.users.find((u) => u.id === c.ownerId)?.name || "Patient" }));
  const doctors = (db.doctors || []).filter((d) => d.hospitalId === hid);

  // First response = earliest quote or message from this hospital after the case reached it.
  const responses = cases
    .map((c) => {
      const sent = c.timeline_events.find((e) => /sent to/i.test(e.label))?.at || c.createdAt;
      const firstQuote = quotes.filter((q) => q.caseId === c.id).map((q) => q.createdAt).sort()[0];
      const firstMsg = (c.messages || []).filter((m) => m.hospitalId === hid || db.users.find((u) => u.id === m.senderId)?.hospitalId === hid).map((m) => m.at).sort()[0];
      const first = [firstQuote, firstMsg].filter(Boolean).sort()[0];
      return first ? Math.max(0, (Date.parse(first) - Date.parse(sent)) / 36e5) : null;
    })
    .filter((x) => x != null);
  const decided = quotes.filter((q) => ["accepted", "declined", "not_selected"].includes(q.status));
  const accepted = quotes.filter((q) => q.status === "accepted");
  const byOrigin = {};
  for (const c of cases) byOrigin[c.countryOfResidence || "Unknown"] = (byOrigin[c.countryOfResidence || "Unknown"] || 0) + 1;

  return ok({
    hospital: { ...hospital, ...(ratingsByHospital(db)[hid] || {}) },
    cases: cases.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)),
    quotations: quotes,
    consultations: consultations.sort((a, b) => `${a.date}${a.timeSlot}`.localeCompare(`${b.date}${b.timeSlot}`)),
    doctors: doctors.map(({ id, name, specialty, image, slug }) => ({ id, name, specialty, image, slug })),
    pipeline: HOSPITAL_PIPELINE.map((p) => ({ ...p, count: cases.filter((c) => c.myStatus === p.id).length })),
    analytics: {
      avgFirstResponseHours: responses.length ? Math.round((responses.reduce((a, b) => a + b, 0) / responses.length) * 10) / 10 : null,
      acceptanceRate: decided.length ? Math.round((accepted.length / decided.length) * 100) : null,
      acceptedValueUSD: accepted.reduce((s, q) => s + q.totalUSD, 0),
      openQuotes: quotes.filter((q) => q.status === "submitted").length,
      byOrigin: Object.entries(byOrigin).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count),
      pendingConsults: consultations.filter((c) => c.status === "requested").length,
    },
  });
}
