import { readDb } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { fail } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  const cases = db.cases.filter((c) => c.ownerId === user.id).map(({ hospitalNotes, staffNotes, ...c }) => c);
  const ids = new Set(cases.map((c) => c.id));
  const data = {
    exportedAt: new Date().toISOString(),
    account: publicUser(db.users.find((u) => u.id === user.id)),
    cases,
    quotations: db.quotations.filter((q) => ids.has(q.caseId)),
    documents: (db.files || []).filter((f) => ids.has(f.caseId)).map(({ storedAs, ...f }) => f),
    consultations: (db.consultations || []).filter((c) => c.ownerId === user.id),
    reviews: (db.reviews || []).filter((r) => r.authorId === user.id),
    notifications: (db.notifications || []).filter((n) => n.userId === user.id),
    accessLog: (db.auditLog || []).filter((a) => ids.has(a.targetId)),
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="wholecare-my-data-${data.exportedAt.slice(0, 10)}.json"`, "Cache-Control": "no-store" },
  });
}
