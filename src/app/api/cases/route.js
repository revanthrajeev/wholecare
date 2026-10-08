import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
    createdAt: new Date().toISOString(),
    timeline_events: [
      { label: "Case submitted", at: new Date().toISOString() },
    ],
  };

  db.cases.push(caseRecord);
  writeDb(db);
  return NextResponse.json(caseRecord, { status: 201 });
}
