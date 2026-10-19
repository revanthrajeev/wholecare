import { ok, fail, readJson, clean, rateLimit } from "@/lib/http";
import { mutateDb, newId } from "@/lib/db";
import { hashPassword, createSession, passwordProblem, publicUser } from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  if (!(await rateLimit("signup", { limit: 8, windowMs: 60 * 60 * 1000 }))) return fail("Too many sign-ups from this network — try again later.", 429);
  const body = await readJson(request);
  const email = clean(body.email, 200).toLowerCase();
  const password = String(body.password || "");
  const name = clean(body.name, 120);
  if (!EMAIL.test(email)) return fail("Please enter a valid email address.");
  const problem = passwordProblem(password);
  if (problem) return fail(problem);
  if (!name) return fail("Please enter your name.");

  const result = mutateDb((db) => {
    db.users = db.users || [];
    if (db.users.some((u) => u.email === email)) return { error: "An account with this email already exists — log in instead.", status: 409 };
    const user = { id: newId("user"), role: "patient", name, email, phone: clean(body.phone, 40), country: clean(body.country, 80), passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
    db.users.push(user);
    return { user };
  });
  if (result.error) return fail(result.error, result.status);
  await createSession(result.user.id);
  return ok(publicUser(result.user), 201);
}
