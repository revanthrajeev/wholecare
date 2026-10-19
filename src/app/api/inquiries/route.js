import { ok, fail, readJson, clean, rateLimit } from "@/lib/http";
import { mutateDb, newId } from "@/lib/db";
import { notifyStaff } from "@/lib/notify";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  if (!(await rateLimit("inquiry", { limit: 8, windowMs: 60 * 60 * 1000 }))) return fail("Too many messages — please try again later.", 429);
  const body = await readJson(request);
  const email = clean(body.email, 200).toLowerCase();
  if (!EMAIL.test(email)) return fail("Please enter a valid email address.");
  const inquiry = {
    id: newId("inq"),
    name: clean(body.name, 120),
    email,
    phone: clean(body.phone, 40),
    topic: ["patient", "partnership", "press", "other"].includes(body.topic) ? body.topic : "patient",
    message: clean(body.message, 3000),
    source: clean(body.source, 40) || "contact",
    status: "new",
    createdAt: new Date().toISOString(),
  };
  mutateDb((db) => {
    db.inquiries = db.inquiries || [];
    db.inquiries.push(inquiry);
    notifyStaff(db, { message: `New ${inquiry.topic} inquiry from ${inquiry.name || inquiry.email}`, link: "/admin?tab=inquiries" });
  });
  return ok({ ok: true }, 201);
}
