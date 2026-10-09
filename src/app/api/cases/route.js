import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  const db = readDb();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const mine = db.cases.filter((c) => c.ownerId === user.id);
  return NextResponse.json(mine);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to create a case." }, { status: 401 });

  const body = await request.json();
  if (!body.consent) {
    return NextResponse.json({ error: "You must consent to sharing your medical information to create a case." }, { status: 400 });
  }
  const db = readDb();

  const caseRecord = {
    id: newId("case"),
    ownerId: user.id,
    patientName: body.patientName || "",
    countryOfResidence: body.countryOfResidence || "",
    preferredDestination: body.preferredDestination || "India",
    condition: body.condition || "",
    existingTreatment: body.existingTreatment || "",
    budgetRange: body.budgetRange || "",
    timeline: body.timeline || "",
    documents: body.documents || [],
    stage: "Submitted",
    sentToHospitals: [],
    consentGivenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    timeline_events: [
      { label: "Case submitted", at: new Date().toISOString() },
    ],
  };

  db.cases.push(caseRecord);
  recordAudit(db, { userId: user.id, action: "case.created", targetId: caseRecord.id });
  writeDb(db);
  return NextResponse.json(caseRecord, { status: 201 });
}
