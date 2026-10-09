import { newId } from "@/lib/db";

// Records an access/action event. Caller is responsible for calling writeDb(db) afterwards.
export function recordAudit(db, { userId, action, targetId }) {
  db.auditLog = db.auditLog || [];
  db.auditLog.push({
    id: newId("audit"),
    userId,
    action,
    targetId,
    at: new Date().toISOString(),
  });
}
