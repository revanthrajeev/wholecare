import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Serverless hosts (Netlify, Lambda, Vercel) only allow writes under /tmp, which
// can be wiped between cold starts — fine for a demo, not for real patient data.
const IS_SERVERLESS = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL);
const DATA_DIR = path.join(process.cwd(), "data");
const SEED_PATH = path.join(DATA_DIR, "seed.json");
const SEED_UPLOADS = path.join(DATA_DIR, "seed-uploads");
const RUNTIME_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), "wholecare") : DATA_DIR;
const DB_PATH = path.join(RUNTIME_DIR, "db.json");
export const UPLOAD_DIR = path.join(RUNTIME_DIR, "uploads");

let checkedVersion = false;

function writeAtomic(file, contents) {
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, contents);
  fs.renameSync(tmp, file);
}

function copySeedUploads() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(SEED_UPLOADS)) return;
  for (const f of fs.readdirSync(SEED_UPLOADS)) {
    const dest = path.join(UPLOAD_DIR, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(path.join(SEED_UPLOADS, f), dest);
  }
}

function seedFresh() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  writeAtomic(DB_PATH, fs.readFileSync(SEED_PATH, "utf-8"));
  copySeedUploads();
}

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    seedFresh();
    checkedVersion = true;
    return;
  }
  if (checkedVersion) return;
  checkedVersion = true;
  // A db.json written by an older build is backed up, then replaced by the new seed.
  const seedVersion = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8")).meta?.schemaVersion;
  let current;
  try {
    current = JSON.parse(fs.readFileSync(DB_PATH, "utf-8")).meta?.schemaVersion;
  } catch {
    current = null;
  }
  if (current !== seedVersion) {
    fs.copyFileSync(DB_PATH, path.join(RUNTIME_DIR, `db.backup-${Date.now()}.json`));
    seedFresh();
  } else {
    copySeedUploads();
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function writeDb(db) {
  writeAtomic(DB_PATH, JSON.stringify(db, null, 2));
}

// Read-modify-write with no await in between, so concurrent requests in this
// process can't interleave and lose each other's updates.
export function mutateDb(fn) {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
}

export function randomToken(bytes = 12) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export { CASE_STAGES, HOSPITAL_PIPELINE } from "@/lib/constants";
