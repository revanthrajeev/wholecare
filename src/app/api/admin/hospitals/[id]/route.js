import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json();
  const db = readDb();
  const hospital = db.hospitals.find((h) => h.id === id);
  if (!hospital) return NextResponse.json({ error: "Hospital not found." }, { status: 404 });

  if (typeof body.verified === "boolean") {
    hospital.verified = body.verified;
    hospital.lastVerified = body.verified ? new Date().toISOString().slice(0, 10) : hospital.lastVerified;
    recordAudit(db, { userId: user.id, action: body.verified ? "hospital.approved" : "hospital.unapproved", targetId: hospital.id });
  }

  writeDb(db);
  return NextResponse.json(hospital);
}
