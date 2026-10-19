import crypto from "crypto";
import { cookies } from "next/headers";
import { readDb, mutateDb, randomToken } from "@/lib/db";

const SESSION_COOKIE = "wc_session";
const SESSION_DAYS = 14;
const SECRET = process.env.SESSION_SECRET || "wholecare-dev-secret-change-in-prod";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn("[whole-care] SESSION_SECRET is not set — sessions are signed with the development secret.");
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

export function passwordProblem(password) {
  if (!password || password.length < 8) return "Use at least 8 characters for your password.";
  return null;
}

function sign(value) {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${mac}`;
}

function unsign(signed) {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return value;
}

export async function createSession(userId) {
  const now = Date.now();
  // Session IDs are the real credential (the HMAC is a second layer), so they must be unguessable.
  const session = { id: `sess_${randomToken(24)}`, userId, createdAt: new Date(now).toISOString() };
  mutateDb((db) => {
    const cutoff = now - SESSION_DAYS * 864e5;
    db.sessions = (db.sessions || []).filter((s) => Date.parse(s.createdAt) > cutoff);
    db.sessions.push(session);
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(session.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  return session;
}

export async function destroySession() {
  const jar = await cookies();
  const sessionId = unsign(jar.get(SESSION_COOKIE)?.value);
  if (sessionId) {
    mutateDb((db) => {
      db.sessions = (db.sessions || []).filter((s) => s.id !== sessionId);
    });
  }
  jar.delete(SESSION_COOKIE);
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function getCurrentUser(db) {
  const jar = await cookies();
  const sessionId = unsign(jar.get(SESSION_COOKIE)?.value);
  if (!sessionId) return null;
  const data = db || readDb();
  const session = (data.sessions || []).find((s) => s.id === sessionId);
  if (!session || Date.now() - Date.parse(session.createdAt) > SESSION_DAYS * 864e5) return null;
  return publicUser((data.users || []).find((u) => u.id === session.userId));
}

export const isStaff = (user) => Boolean(user && (user.role === "admin" || user.role === "coordinator"));
