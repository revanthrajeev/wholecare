import { ok, fail, readJson, rateLimit } from "@/lib/http";
import { readDb } from "@/lib/db";
import { verifyPassword, createSession, publicUser } from "@/lib/auth";

export async function POST(request) {
  if (!(await rateLimit("login", { limit: 10, windowMs: 15 * 60 * 1000 }))) return fail("Too many attempts — please wait 15 minutes and try again.", 429);
  const body = await readJson(request);
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = (readDb().users || []).find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) return fail("Invalid email or password.", 401);
  await createSession(user.id);
  return ok(publicUser(user));
}
