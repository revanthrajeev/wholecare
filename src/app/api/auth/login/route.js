import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  const db = readDb();
  const user = (db.users || []).find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);
  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
