import { ok, fail, readJson } from "@/lib/http";
import { readDb, mutateDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return ok([]);
  const mine = (readDb().notifications || []).filter((n) => n.userId === user.id);
  return ok(mine.slice(-50).reverse());
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const body = await readJson(request);
  mutateDb((db) => {
    (db.notifications || []).forEach((n) => {
      if (n.userId === user.id && (!body.id || n.id === body.id)) n.read = true;
    });
  });
  return ok({ ok: true });
}
