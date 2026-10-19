import { ok, fail, readJson, clean, rateLimit } from "@/lib/http";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewCase, isOwner } from "@/lib/access";
import { generateJSON } from "@/lib/ai";
import { organizeQuestionsRules } from "@/lib/ai-rules";

const CATEGORIES = ["Diagnosis", "Treatment", "Alternatives", "Recovery", "Risks", "Travel", "Cost", "Follow-up"];
const SCHEMA = {
  type: "object",
  properties: {
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string", enum: CATEGORIES }, questions: { type: "array", items: { type: "string" } } },
        required: ["name", "questions"],
        additionalProperties: false,
      },
    },
  },
  required: ["categories"],
  additionalProperties: false,
};

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return fail("Not signed in.", 401);
  if (!(await rateLimit("ai-questions", { limit: 30, windowMs: 60 * 60 * 1000 }))) return fail("Too many requests — try again later.", 429);
  const body = await readJson(request);
  const text = clean(body.text, 3000);
  if (text.length < 5) return fail("Write a few questions or notes first.");
  const db = readDb();
  const c = db.cases.find((x) => x.id === body.caseId);
  if (!c || !canViewCase(user, c) || !isOwner(user, c)) return fail("Case not found.", 404);

  const system = `You help patients prepare for a consultation by organising their own notes into clear questions for the specialist. Group them only under these headings: ${CATEGORIES.join(", ")}. Rewrite each note as a clear, specific question in the patient's language. Never answer the questions or add medical opinions. Omit empty headings.`;
  const result = await generateJSON({ system, messages: [{ role: "user", content: `Condition: ${c.condition}\n\nMy notes:\n${text}` }], schema: SCHEMA, effort: "low" });
  const data = result?.data?.categories?.length ? result.data : organizeQuestionsRules(text);
  const list = { ...data, provider: result?.data?.categories?.length ? result.provider : "rules", generatedAt: new Date().toISOString(), raw: text };
  mutateDb((d) => {
    d.cases.find((x) => x.id === c.id).questionList = list;
  });
  return ok(list);
}
