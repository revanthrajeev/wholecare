import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, readDb, newId } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { canViewCase } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { notify, notifyHospital } from "@/lib/notify";

// Hospitals see the thread minus other hospitals' messages; patients and staff see all.
function visible(user, c) {
  const msgs = c.messages || [];
  if (user.role !== "hospital") return msgs;
  const myUsers = new Set([user.id]);
  return msgs.filter((m) => m.senderRole !== "hospital" || myUsers.has(m.senderId) || m.hospitalId === user.hospitalId);
}

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c || !canViewCase(user, c)) return fail("Case not found.", 404);
  return ok(visible(user, c));
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);
  const text = clean(body.text, 4000);
  if (!text) return fail("Write a message first.");

  const result = mutateDb((db) => {
    const c = db.cases.find((x) => x.id === id);
    if (!c || !canViewCase(user, c)) return { error: "Case not found.", status: 404 };
    if (user.role === "patient" && !(c.sentToHospitals || []).length && !c.coordinatorId) return { error: "Send your case to a hospital (or wait for your coordinator) before messaging.", status: 400 };
    const staff = isStaff(user);
    const message = {
      id: newId("msg"),
      senderId: user.id,
      senderRole: staff ? "coordinator" : user.role,
      senderLabel: staff ? `${user.name} (Whole Care)` : user.role === "hospital" ? user.name : user.name || c.patientName,
      hospitalId: user.role === "hospital" ? user.hospitalId : null,
      text,
      at: new Date().toISOString(),
    };
    c.messages = c.messages || [];
    c.messages.push(message);
    c.updatedAt = message.at;
    if (user.role === "patient") {
      (c.sentToHospitals || []).forEach((hid) => notifyHospital(db, hid, { message: `New message from ${c.patientName}`, link: `/hospital/${hid}/case/${c.id}` }));
      if (c.coordinatorId) notify(db, { userId: c.coordinatorId, message: `New message on ${c.patientName}'s case`, link: `/case/${c.id}?tab=messages` });
    } else {
      notify(db, { userId: c.ownerId, message: `${message.senderLabel} sent you a message`, link: `/case/${c.id}?tab=messages` });
      if (staff) (c.sentToHospitals || []).forEach((hid) => notifyHospital(db, hid, { message: `Whole Care coordinator messaged on ${c.patientName}'s case`, link: `/hospital/${hid}/case/${c.id}` }));
    }
    recordAudit(db, { userId: user.id, action: "message.sent", targetId: c.id });
    return { message };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.message, 201);
}
