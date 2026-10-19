import { ok, fail } from "@/lib/http";
import { readDb } from "@/lib/db";
import { getDoctorBySlug } from "@/lib/data";
import { slotGrid } from "@/lib/schedule";
import { destinationByCountry } from "@/content/destinations";

const ACTIVE_CONSULT = ["requested", "confirmed"];

export async function GET(request, { params }) {
  const { slug } = await params;
  const db = readDb();
  const doctor = getDoctorBySlug(slug, db);
  if (!doctor) return fail("Doctor not found.", 404);
  const booked = (db.consultations || []).filter((c) => c.doctorId === doctor.id && ACTIVE_CONSULT.includes(c.status));
  const dest = destinationByCountry(doctor.hospital.country);
  return ok({ timezone: dest?.timezone || "hospital local time", timeZone: dest?.timeZone || null, days: slotGrid(doctor, booked, 14) });
}
