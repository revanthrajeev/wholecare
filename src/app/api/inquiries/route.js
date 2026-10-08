import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";

export async function POST(request) {
  const body = await request.json();
  const email = (body.email || "").trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const db = readDb();
  db.inquiries = db.inquiries || [];
  db.inquiries.push({
    id: newId("inq"),
    name: body.name || "",
    email,
    message: body.message || "",
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  return NextResponse.json({ ok: true }, { status: 201 });
}
