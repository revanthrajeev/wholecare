import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.cases);
}

export async function POST(request) {
  const body = await request.json();
  const db = readDb();

  const caseRecord = {
    id: newId("case"),
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
