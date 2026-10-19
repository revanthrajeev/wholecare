import fs from "fs";
import path from "path";
import { ok, fail } from "@/lib/http";
import { mutateDb, readDb, newId, UPLOAD_DIR } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase } from "@/lib/access";
import { recordAudit } from "@/lib/audit";
import { notify, notifyHospital } from "@/lib/notify";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, FILE_CATEGORIES } from "@/lib/constants";

const EXT_TYPES = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".dcm": "application/dicom", ".doc": "application/msword", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

// Checks the first bytes so a renamed executable can't pass as a PDF or image.
function sniffOk(buf, type) {
  const head = buf.subarray(0, 12);
  if (type === "application/pdf") return head.subarray(0, 4).toString() === "%PDF";
  if (type === "image/png") return head[0] === 0x89 && head.subarray(1, 4).toString() === "PNG";
  if (type === "image/jpeg") return head[0] === 0xff && head[1] === 0xd8;
  if (type === "image/webp") return head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
  if (type === "application/dicom") return buf.length > 132 && buf.subarray(128, 132).toString() === "DICM";
  if (type.includes("word")) return (head[0] === 0x50 && head[1] === 0x4b) || (head[0] === 0xd0 && head[1] === 0xcf);
  return false;
}

export async function POST(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  const db = readDb();
  const c = db.cases.find((x) => x.id === id);
  if (!c || !canViewCase(user, c)) return fail("Case not found.", 404);

  let form;
  try {
    form = await request.formData();
  } catch {
    return fail("Upload failed — please try again.");
  }
  const files = form.getAll("files").filter((f) => f && typeof f === "object" && "arrayBuffer" in f);
  const category = FILE_CATEGORIES.some((x) => x.id === form.get("category")) ? form.get("category") : "report";
  if (!files.length) return fail("Choose at least one file.");
  if (files.length > 10) return fail("Upload up to 10 files at a time.");

  const prepared = [];
  for (const f of files) {
    const ext = path.extname(f.name || "").toLowerCase();
    const type = ALLOWED_UPLOAD_TYPES[f.type] ? f.type : EXT_TYPES[ext];
    if (!type) return fail(`${f.name}: only PDF, JPG, PNG, WEBP, DICOM and Word files are accepted.`);
    if (f.size > MAX_UPLOAD_BYTES) return fail(`${f.name} is larger than 15 MB.`);
    const buf = Buffer.from(await f.arrayBuffer());
    if (!sniffOk(buf, type)) return fail(`${f.name} doesn't look like a valid ${ALLOWED_UPLOAD_TYPES[type]} file.`);
    const fileId = newId("file");
    prepared.push({ fileId, buf, record: { id: fileId, caseId: c.id, uploadedBy: user.id, uploaderRole: user.role, name: (f.name || `document${ext}`).replace(/[^\w.\- ()]/g, "_").slice(0, 120), category, type, size: f.size, storedAs: `${fileId}${ALLOWED_UPLOAD_TYPES[type]}`, createdAt: new Date().toISOString() } });
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  for (const p of prepared) fs.writeFileSync(path.join(UPLOAD_DIR, p.record.storedAs), p.buf);

  const saved = mutateDb((d) => {
    const kase = d.cases.find((x) => x.id === id);
    d.files = d.files || [];
    for (const p of prepared) d.files.push(p.record);
    const now = new Date().toISOString();
    kase.timeline_events.push({ label: `${prepared.length} document${prepared.length > 1 ? "s" : ""} uploaded`, at: now, kind: user.role === "hospital" ? "hospital" : "patient" });
    kase.updatedAt = now;
    if (user.role === "patient") (kase.sentToHospitals || []).forEach((hid) => notifyHospital(d, hid, { message: `New documents from ${kase.patientName}`, link: `/hospital/${hid}/case/${kase.id}` }));
    else notify(d, { userId: kase.ownerId, message: `New document shared on your case`, link: `/case/${kase.id}?tab=documents` });
    recordAudit(d, { userId: user.id, action: "file.uploaded", targetId: kase.id });
    return prepared.map(({ record: { storedAs, ...r } }) => r);
  });
  return ok(saved, 201);
}
