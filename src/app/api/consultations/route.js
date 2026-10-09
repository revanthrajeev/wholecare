import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const db = readDb();
  const mine = (db.consultations || []).filter((c) => c.ownerId === user.id);
  return NextResponse.json(mine);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to book a consultation." }, { status: 401 });

  const body = await request.json();
  const db = readDb();
  const doctor = db.doctors.find((d) => d.id === body.doctorId);
  if (!doctor) return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  if (!body.date || !body.timeSlot) {
    return NextResponse.json({ error: "Date and time slot are required." }, { status: 400 });
  }

  const hospital = db.hospitals.find((h) => h.id === doctor.hospitalId);
  const consultation = {
    id: newId("consult"),
    ownerId: user.id,
    doctorId: doctor.id,
    doctorName: doctor.name,
    hospitalName: hospital?.name || "",
    specialty: doctor.specialty,
    date: body.date,
    timeSlot: body.timeSlot,
    reason: body.reason || "",
    status: "Requested",
    createdAt: new Date().toISOString(),
  };

  db.consultations = db.consultations || [];
  db.consultations.push(consultation);
  writeDb(db);
  return NextResponse.json(consultation, { status: 201 });
}
