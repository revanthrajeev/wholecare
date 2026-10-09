import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json([], { status: 200 });
  const db = readDb();
  const mine = (db.notifications || []).filter((n) => n.userId === user.id).slice().reverse();
  return NextResponse.json(mine);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await request.json();
  const db = readDb();
  (db.notifications || []).forEach((n) => {
    if (n.userId === user.id && (!body.id || n.id === body.id)) n.read = true;
  });
  writeDb(db);
  return NextResponse.json({ ok: true });
}
