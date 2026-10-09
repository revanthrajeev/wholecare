import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = (body.name || "").trim();
  const city = (body.city || "").trim();
  const country = (body.country || "").trim();
  const accreditation = (body.accreditation || "").trim();
  const specialties = (body.specialties || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!email || !password || password.length < 6 || !name || !city || !country || specialties.length === 0) {
    return NextResponse.json({ error: "Hospital name, city, country, at least one specialty, email and a password of 6+ characters are required." }, { status: 400 });
  }

  const db = readDb();
  db.users = db.users || [];
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const hospitalId = newId("h");
  const hospital = {
    id: hospitalId,
    name,
    city,
    country,
    accreditation: accreditation || "Pending accreditation review",
    specialties,
    intlPatientDept: true,
    languages: ["English"],
    verified: false,
    lastVerified: null,
    rating: null,
    reviewCount: 0,
  };
  db.hospitals.push(hospital);

  const user = {
    id: newId("user"),
    role: "hospital",
    hospitalId,
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);

  await createSession(user.id);
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
