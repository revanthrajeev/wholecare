import crypto from "crypto";
import { cookies } from "next/headers";
import { readDb, writeDb, newId } from "@/lib/db";

const SESSION_COOKIE = "wc_session";
const SECRET = process.env.SESSION_SECRET || "wholecare-dev-secret-change-in-prod";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
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
  const db = readDb();
  const session = { id: newId("sess"), userId, createdAt: new Date().toISOString() };
  db.sessions = db.sessions || [];
  db.sessions.push(session);
  writeDb(db);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(session.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return session;
}

export async function destroySession() {
  const jar = await cookies();
  const sessionId = unsign(jar.get(SESSION_COOKIE)?.value);
  if (sessionId) {
    const db = readDb();
    db.sessions = (db.sessions || []).filter((s) => s.id !== sessionId);
    writeDb(db);
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const sessionId = unsign(jar.get(SESSION_COOKIE)?.value);
  if (!sessionId) return null;
  const db = readDb();
  const session = (db.sessions || []).find((s) => s.id === sessionId);
  if (!session) return null;
  const user = (db.users || []).find((u) => u.id === session.userId);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
