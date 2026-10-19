import { ok, fail, readJson, rateLimit } from "@/lib/http";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase } from "@/lib/access";
import { generateJSON } from "@/lib/ai";
import { caseSummaryRules } from "@/lib/ai-rules";

const SCHEMA = {
  type: "object",
  properties: {
    structuredSummary: { type: "string" },
    suggestedSpecialty: { type: "string" },
    triagePriority: { type: "string", enum: ["Routine", "Priority", "Urgent — recommend immediate coordinator review"] },
    missingInformation: { type: "array", items: { type: "string" } },
    suggestedQuestionsForDoctor: { type: "array", items: { type: "string" } },
  },
  required: ["structuredSummary", "suggestedSpecialty", "triagePriority", "missingInformation", "suggestedQuestionsForDoctor"],
  additionalProperties: false,
};

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  if (!(await rateLimit("ai-summary", { limit: 20, windowMs: 60 * 60 * 1000 }))) return fail("Too many requests — try again later.", 429);
  const { caseId } = await readJson(request);
  const db = readDb();
  const c = db.cases.find((x) => x.id === caseId);
  if (!c || !canViewCase(user, c)) return fail("Case not found.", 404);
  const files = (db.files || []).filter((f) => f.caseId === c.id);

  const system = `You are an intake assistant for a medical-travel coordination platform. You organise what a patient has reported so a care coordinator can act on it. You are not a clinician: never diagnose, never interpret results, never recommend a treatment decision. Write neutrally, in English, for a coordinator.`;
  const prompt = `Patient intake (patient-reported):
- Request type: ${c.type === "second_opinion" ? "Written second opinion" : "Treatment quote"}
- Patient: ${c.patientName}${c.patientAge ? `, age ${c.patientAge}` : ""}, from ${c.countryOfResidence || "not stated"}
- Condition as described: ${c.condition}
- Care so far: ${c.existingTreatment || "not provided"}
${c.questions ? `- Questions for the specialist: ${c.questions}\n` : ""}- Preferred destination: ${c.preferredDestination || "not stated"}
- Budget: ${c.budgetRange || "not stated"}; timeline: ${c.timeline || "not stated"}
- Documents uploaded: ${files.length ? files.map((f) => `${f.name} (${f.category})`).join(", ") : "none"}

Produce: a 2–3 sentence neutral summary; the most relevant specialty; a triage priority (Urgent only if the description suggests possible emergency symptoms); a list of specific missing documents or details to request; and 3–5 questions the patient may want to ask a specialist.`;

  const result = await generateJSON({ system, messages: [{ role: "user", content: prompt }], schema: SCHEMA, effort: "low" });
  const data = result?.data?.structuredSummary ? result.data : caseSummaryRules(c, files.length);
  const summary = { ...data, provider: result?.data?.structuredSummary ? result.provider : "rules", model: result?.model || null, generatedAt: new Date().toISOString() };
  mutateDb((d) => {
    const kase = d.cases.find((x) => x.id === c.id);
    kase.aiSummary = summary;
  });
  return ok(summary);
}
