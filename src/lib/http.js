import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const ok = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (error, status = 400) => NextResponse.json({ error }, { status });

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export const clean = (v, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Fixed-window in-memory limiter. Per server instance, which is enough to blunt
// password guessing and assistant abuse in a single-node deployment.
const buckets = new Map();
export async function rateLimit(key, { limit, windowMs }) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || now > bucket.reset) {
    buckets.set(id, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k);
  }
  return bucket.count <= limit;
}
