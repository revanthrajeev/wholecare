import { newId } from "@/lib/db";

// In-app notifications. Callers run these inside mutateDb, so no write here.
export function notify(db, { userId, message, link }) {
  if (!userId) return;
  db.notifications = db.notifications || [];
  db.notifications.push({ id: newId("notif"), userId, message, link: link || null, read: false, createdAt: new Date().toISOString() });
}

export function notifyStaff(db, payload) {
  for (const u of db.users || []) if (u.role === "admin" || u.role === "coordinator") notify(db, { ...payload, userId: u.id });
}

export function notifyHospital(db, hospitalId, payload) {
  for (const u of db.users || []) if (u.role === "hospital" && u.hospitalId === hospitalId) notify(db, { ...payload, userId: u.id });
}
