import fs from "fs";
import path from "path";
import { ok, fail } from "@/lib/http";
import { mutateDb, readDb, UPLOAD_DIR } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { canViewCase } from "@/lib/access";
import { recordAudit } from "@/lib/audit";

function locate(db, id) {
  const f = (db.files || []).find((x) => x.id === id);
  const c = f && db.cases.find((x) => x.id === f.caseId);
  return { f, c };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  const { f, c } = locate(db, id);
  if (!f || !canViewCase(user, c)) return fail("File not found.", 404);
  const file = path.join(UPLOAD_DIR, path.basename(f.storedAs));
  if (!fs.existsSync(file)) return fail("This file is no longer available.", 410);
  if (c.ownerId !== user.id) mutateDb((d) => recordAudit(d, { userId: user.id, action: "file.downloaded", targetId: f.id }));
  const inline = f.type === "application/pdf" || f.type.startsWith("image/");
  return new Response(fs.readFileSync(file), {
    headers: {
      "Content-Type": f.type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${f.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'")}"; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const result = mutateDb((db) => {
    const { f, c } = locate(db, id);
    if (!f || !canViewCase(user, c)) return { error: "File not found.", status: 404 };
    if (f.uploadedBy !== user.id && !isStaff(user)) return { error: "Only the person who uploaded a file can remove it.", status: 403 };
    db.files = db.files.filter((x) => x.id !== id);
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, path.basename(f.storedAs)));
    } catch {}
    c.timeline_events.push({ label: `Document removed: ${f.name}`, at: new Date().toISOString(), kind: user.role === "hospital" ? "hospital" : "patient" });
    recordAudit(db, { userId: user.id, action: "file.deleted", targetId: id });
    return { ok: true };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result);
}
