import fs from "fs";
import path from "path";
import os from "os";

const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

// On Netlify (and most serverless hosts) the deployed project directory is
// read-only — only /tmp is writable, and it may be wiped between cold
// starts. Writing to /tmp keeps the demo functional there; it just means
// data resets whenever the function container recycles. Local dev keeps
// using data/db.json so state survives `npm run dev` restarts.
const DB_PATH = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join(os.tmpdir(), "wholecare-db.json")
  : path.join(process.cwd(), "data", "db.json");

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = fs.readFileSync(SEED_PATH, "utf-8");
    fs.writeFileSync(DB_PATH, seed);
  }
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export const CASE_STAGES = [
  "Submitted",
  "Under Review",
  "Sent to Hospitals",
  "Quotation Received",
  "Confirmed",
  "Completed",
];
