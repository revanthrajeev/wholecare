import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

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
