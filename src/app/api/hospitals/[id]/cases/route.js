import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const db = readDb();
  const cases = db.cases.filter((c) => (c.sentToHospitals || []).includes(id));
  const quotations = db.quotations.filter((q) => q.hospitalId === id);
  return NextResponse.json({ cases, quotations });
}
