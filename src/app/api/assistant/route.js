import { readDb, mutateDb } from "@/lib/db";
import { getPublicHospitals, getPublicPackages } from "@/lib/data";
import { generateJSON } from "@/lib/ai";
import { assistantRules } from "@/lib/ai-rules";
import { ok, fail, readJson, rateLimit } from "@/lib/http";
import { TREATMENTS, PRICE_DISCLAIMER } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";
import { GUIDES } from "@/content/guides";

const STATIC_PAGES = ["/get-quote", "/second-opinion", "/consult", "/packages", "/calculator", "/countries/compare", "/match", "/treatments", "/hospitals", "/doctors", "/countries", "/guides", "/contact", "/about", "/for-hospitals"];

const SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string", description: "Answer for the patient, under 120 words, in the patient's language." },
    actions: {
      type: "array",
      description: "Up to 3 next steps, each linking to an allowed path.",
      items: {
        type: "object",
        properties: { label: { type: "string" }, href: { type: "string" } },
        required: ["label", "href"],
        additionalProperties: false,
      },
    },
  },
  required: ["reply", "actions"],
  additionalProperties: false,
};

function buildCatalog(db) {
  const hospitals = getPublicHospitals(db);
  const packages = getPublicPackages(db);
  const treatments = TREATMENTS.map((t) => {
    const prices = t.priceOnAssessment ? "price after records review" : Object.entries(t.prices).map(([c, [lo, hi]]) => `${c} $${lo}-${hi}`).join("; ");
    const home = Object.entries(t.home || {}).map(([c, [lo, hi]]) => `${c} $${lo}-${hi}`).join("; ");
    return `- ${t.name} [/treatments/${t.slug}] (${t.specialty}): ${prices}${home ? ` | home-country reference: ${home}` : ""} | hospital stay ${t.hospitalStay}, in-country ${t.inCountry}${t.legalNote ? ` | note: ${t.legalNote}` : ""}`;
  }).join("\n");
  const destinations = DESTINATIONS.map((d) => `- ${d.country} [/countries/${d.slug}]: ${d.tagline} Strengths: ${d.strengths.join(", ")}. Visa: ${d.visa.type}. Best time: ${d.bestTime}. Accreditation: ${d.accreditation.join(", ")}.`).join("\n");
  const hosp = hospitals.map((h) => `- ${h.name} [/hospitals/${h.slug}], ${h.city}, ${h.country}: ${h.specialties.join(", ")}; ${h.accreditations.join(", ")}; languages ${h.languages.join(", ")}${h.rating ? `; sample-review rating ${h.rating}` : ""}`).join("\n");
  const pkgs = packages.map((p) => `- ${p.title} at ${p.hospital.name}: from $${p.priceUSD} [/packages]`).join("\n");
  const guides = GUIDES.map((g) => `- ${g.title} [/guides/${g.slug}]`).join("\n");
  return { text: `TREATMENTS (indicative USD):\n${treatments}\n\nDESTINATIONS:\n${destinations}\n\nHOSPITALS (all are sample demonstration listings):\n${hosp}\n\nPACKAGES (sample):\n${pkgs}\n\nGUIDES:\n${guides}`, hospitals };
}

function allowedHref(href, slugs) {
  if (typeof href !== "string" || !href.startsWith("/") || href.startsWith("//")) return false;
  const path = href.split(/[?#]/)[0];
  if (STATIC_PAGES.includes(path)) return true;
  const [, section, slug] = path.split("/");
  return Boolean(slug && slugs[section]?.has(slug));
}

export async function POST(request) {
  if (!(await rateLimit("assistant", { limit: 30, windowMs: 10 * 60 * 1000 }))) {
    return fail("You've sent a lot of messages — please wait a few minutes, or contact a coordinator.", 429);
  }
  const body = await readJson(request);
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  while (history.length && history[0].role !== "user") history.shift();
  const last = history[history.length - 1];
  if (!last || last.role !== "user") return fail("Send a question to get started.");

  const db = readDb();
  const { text: catalog, hospitals } = buildCatalog(db);
  const slugs = {
    treatments: new Set(TREATMENTS.map((t) => t.slug)),
    countries: new Set([...DESTINATIONS.map((d) => d.slug), "compare"]),
    guides: new Set(GUIDES.map((g) => g.slug)),
    hospitals: new Set(hospitals.map((h) => h.slug)),
  };

  const system = `You are the Whole Care care navigator, a guide on a medical-travel coordination website. Whole Care helps patients get specialist opinions, itemized hospital quotes, travel planning and aftercare. It is not a medical provider.

Rules:
- Never diagnose, interpret symptoms or test results, or recommend a specific treatment for the person. For medical questions, say a specialist needs to review their records and suggest a video consult (/consult) or written second opinion (/second-opinion).
- If someone describes an emergency (chest pain, severe bleeding, trouble breathing, stroke signs, thoughts of self-harm), tell them to contact local emergency services immediately.
- Use only the catalog below for prices, hospitals and destinations. Prices are indicative ranges, not quotes: ${PRICE_DISCLAIMER}
- All hospitals, doctors, packages and reviews listed are sample demonstration data — never present them as real partners or guarantee availability.
- Visa rules change; tell people to confirm on official government portals.
- Keep replies under 120 words, warm and plain. Reply in the language the patient writes in.
- Suggest up to 3 actions. Each href must be a path shown in square brackets in the catalog, or one of: ${STATIC_PAGES.join(", ")}. You may add ?treatment=<slug> to /get-quote or /countries/compare.

CATALOG
${catalog}`;

  const result = await generateJSON({ system, messages: history, schema: SCHEMA, effort: "low", cacheSystem: true });
  let reply;
  let actions;
  let provider = "rules";
  if (result?.data?.reply) {
    reply = String(result.data.reply).slice(0, 1500);
    actions = (result.data.actions || []).filter((a) => a && allowedHref(a.href, slugs)).slice(0, 3).map((a) => ({ label: String(a.label).slice(0, 60), href: a.href }));
    provider = result.provider;
  } else {
    ({ reply, actions } = assistantRules(last.content));
  }

  mutateDb((d) => {
    d.assistantLog = (d.assistantLog || []).slice(-499);
    d.assistantLog.push({ at: new Date().toISOString(), provider, turns: history.length });
  });

  return ok({ reply, actions, provider });
}
