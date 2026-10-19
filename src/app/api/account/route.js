import fs from "fs";
import path from "path";
import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, UPLOAD_DIR } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword, passwordProblem, publicUser, destroySession } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);
  const result = mutateDb((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (body.newPassword) {
      if (!verifyPassword(String(body.currentPassword || ""), u.passwordHash)) return { error: "Your current password is incorrect.", status: 400 };
      const problem = passwordProblem(body.newPassword);
      if (problem) return { error: problem, status: 400 };
      u.passwordHash = hashPassword(body.newPassword);
      recordAudit(db, { userId: u.id, action: "account.password_changed", targetId: u.id });
    }
    for (const k of ["name", "phone", "country"]) if (typeof body[k] === "string") u[k] = clean(body[k], k === "name" ? 120 : 80);
    return { user: publicUser(u) };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.user);
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  if (user.role !== "patient") return fail("Hospital and staff accounts are closed by the Whole Care team — please contact us.", 403);
  const body = await readJson(request);
  const result = mutateDb((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (!verifyPassword(String(body.password || ""), u.passwordHash)) return { error: "Password is incorrect.", status: 400 };
    const caseIds = new Set(db.cases.filter((c) => c.ownerId === u.id).map((c) => c.id));
    for (const f of (db.files || []).filter((x) => caseIds.has(x.caseId))) {
      try {
        fs.unlinkSync(path.join(UPLOAD_DIR, path.basename(f.storedAs)));
      } catch {}
    }
    db.files = (db.files || []).filter((x) => !caseIds.has(x.caseId));
    db.cases = db.cases.filter((c) => !caseIds.has(c.id));
    db.quotations = db.quotations.filter((q) => !caseIds.has(q.caseId));
    db.consultations = (db.consultations || []).filter((c) => c.ownerId !== u.id);
    db.notifications = (db.notifications || []).filter((n) => n.userId !== u.id);
    db.reviews = (db.reviews || []).filter((r) => r.authorId !== u.id);
    db.sessions = (db.sessions || []).filter((s) => s.userId !== u.id);
    db.users = db.users.filter((x) => x.id !== u.id);
    recordAudit(db, { userId: "deleted-user", action: "account.deleted", targetId: `${caseIds.size} cases removed` });
    return { ok: true };
  });
  if (result.error) return fail(result.error, result.status);
  await destroySession();
  return ok(result);
}
