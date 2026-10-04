import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  const quotations = db.quotations.filter((q) => q.caseId === id);
  const hospitals = db.hospitals;
  return NextResponse.json({ case: c, quotations, hospitals });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  if (body.stage) {
    c.stage = body.stage;
    c.timeline_events.push({ label: `Stage: ${body.stage}`, at: new Date().toISOString() });
  }
  if (body.sendToHospitalIds) {
    c.sentToHospitals = Array.from(new Set([...(c.sentToHospitals || []), ...body.sendToHospitalIds]));
    c.stage = "Sent to Hospitals";
    c.timeline_events.push({
      label: `Case sent to ${body.sendToHospitalIds.length} hospital(s)`,
      at: new Date().toISOString(),
    });
  }

  writeDb(db);
  return NextResponse.json(c);
}
