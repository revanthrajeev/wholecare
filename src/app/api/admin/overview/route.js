import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const db = readDb();
  const patients = (db.users || []).filter((u) => u.role === "patient");
  const hospitalUsers = (db.users || []).filter((u) => u.role === "hospital");

  return NextResponse.json({
    stats: {
      totalCases: db.cases.length,
      totalPatients: patients.length,
      totalHospitals: db.hospitals.length,
      totalQuotations: db.quotations.length,
      totalInquiries: (db.inquiries || []).length,
    },
    cases: db.cases.map((c) => ({
      id: c.id,
      patientName: c.patientName,
      condition: c.condition,
      stage: c.stage,
      sentToHospitals: c.sentToHospitals || [],
      createdAt: c.createdAt,
    })),
    hospitals: db.hospitals,
    patients: patients.map(({ passwordHash, ...p }) => p),
    inquiries: (db.inquiries || []).slice().reverse(),
    auditLog: (db.auditLog || []).slice().reverse().slice(0, 100).map((a) => ({
      ...a,
      userEmail: (db.users || []).find((u) => u.id === a.userId)?.email || a.userId,
    })),
  });
}
