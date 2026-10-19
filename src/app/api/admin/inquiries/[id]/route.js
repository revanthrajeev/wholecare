import { ok, fail, readJson } from "@/lib/http";
import { mutateDb } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

const STATUSES = ["new", "contacted", "converted", "closed"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!isStaff(user)) return fail("Not authorized.", 403);
  const { status } = await readJson(request);
  if (!STATUSES.includes(status)) return fail("Unknown status.");
  const inq = mutateDb((db) => {
    const i = (db.inquiries || []).find((x) => x.id === id);
    if (i) {
      i.status = status;
      i.updatedAt = new Date().toISOString();
      i.handledBy = user.name;
    }
    return i;
  });
  if (!inq) return fail("Inquiry not found.", 404);
  return ok(inq);
}
