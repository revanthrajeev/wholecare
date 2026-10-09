import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";

function canAccess(user, c) {
  if (!user) return false;
  if (user.role === "patient") return c.ownerId === user.id;
  if (user.role === "hospital") return (c.sentToHospitals || []).includes(user.hospitalId);
  if (user.role === "admin") return true;
  return false;
}

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (!canAccess(user, c)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  return NextResponse.json(c.messages || []);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (!canAccess(user, c)) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json();
  if (!body.text?.trim()) return NextResponse.json({ error: "Message text required." }, { status: 400 });

  const senderLabel = user.role === "hospital" ? user.name : (user.name || c.patientName);
  const message = {
    id: newId("msg"),
    senderId: user.id,
    senderRole: user.role,
    senderLabel,
    text: body.text.trim(),
    at: new Date().toISOString(),
  };

  c.messages = c.messages || [];
  c.messages.push(message);
  writeDb(db);

  recordAudit(db, { userId: user.id, action: "message.sent", targetId: c.id });

  if (user.role === "patient") {
    (c.sentToHospitals || []).forEach((hid) => {
      const hospitalUser = db.users.find((u) => u.role === "hospital" && u.hospitalId === hid);
      if (hospitalUser) notify(db, { userId: hospitalUser.id, message: `New message on case ${c.patientName}`, link: `/hospital/${hid}/case/${c.id}` });
    });
  } else if (user.role === "hospital") {
    notify(db, { userId: c.ownerId, message: `${senderLabel} sent a message on your case`, link: `/case/${c.id}` });
  }
  writeDb(db);

  return NextResponse.json(message, { status: 201 });
}
