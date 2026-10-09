import { newId } from "@/lib/db";

// Creates an in-app notification. Caller is responsible for calling writeDb(db) afterwards.
export function notify(db, { userId, message, link }) {
  db.notifications = db.notifications || [];
  db.notifications.push({
    id: newId("notif"),
    userId,
    message,
    link: link || null,
    read: false,
    createdAt: new Date().toISOString(),
  });
}
