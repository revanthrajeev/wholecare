import { ok, fail, readJson } from "@/lib/http";
import { mutateDb } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!isStaff(user)) return fail("Not authorized.", 403);
  const { status } = await readJson(request);
  if (!["published", "hidden"].includes(status)) return fail("Unknown status.");
  const review = mutateDb((db) => {
    const r = (db.reviews || []).find((x) => x.id === id);
    if (r) {
      r.status = status;
      recordAudit(db, { userId: user.id, action: `review.${status}`, targetId: r.id });
    }
    return r;
  });
  if (!review) return fail("Review not found.", 404);
  return ok(review);
}
