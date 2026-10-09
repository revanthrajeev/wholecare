import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { notify } from "@/lib/notify";
import { recordAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const db = readDb();

  const c = db.cases.find((x) => x.id === body.caseId);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const quotation = {
    id: newId("quote"),
    caseId: body.caseId,
    hospitalId: body.hospitalId,
    procedure: body.procedure || "",
    doctor: body.doctor || "",
    hospitalStayDays: body.hospitalStayDays || "",
    estimatedCost: body.estimatedCost || "",
    exclusions: body.exclusions || "",
    validityDays: body.validityDays || "14",
    status: body.status || "accepted",
    createdAt: new Date().toISOString(),
  };

  db.quotations.push(quotation);
  c.stage = "Quotation Received";
  c.timeline_events.push({
    label: `Quotation received from hospital`,
    at: new Date().toISOString(),
  });

  const user = await getCurrentUser();
  recordAudit(db, { userId: user?.id || "unknown", action: "quotation.created", targetId: quotation.id });
  notify(db, { userId: c.ownerId, message: `New quotation received for your case`, link: `/case/${c.id}` });

  writeDb(db);
  return NextResponse.json(quotation, { status: 201 });
}
