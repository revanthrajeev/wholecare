import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const name = body.name || "";

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Email and a password of at least 6 characters are required." }, { status: 400 });
  }

  const db = readDb();
  db.users = db.users || [];
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const user = {
    id: newId("user"),
    role: "patient",
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
