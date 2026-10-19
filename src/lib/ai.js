import Anthropic from "@anthropic-ai/sdk";

// Provider order: Claude (ANTHROPIC_API_KEY) → Ollama (only if OLLAMA_URL is set) → caller's rules fallback.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const OLLAMA_URL = process.env.OLLAMA_URL || "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

let client = null;
function getClaude() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  client ||= new Anthropic();
  return client;
}

export function aiProviderName() {
  if (getClaude()) return "claude";
  if (OLLAMA_URL) return "ollama";
  return "rules";
}

function textOf(message) {
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

async function claudeJSON({ system, messages, schema, effort, cacheSystem }) {
  const claude = getClaude();
  const response = await claude.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: system, ...(cacheSystem ? { cache_control: { type: "ephemeral" } } : {}) }],
    output_config: { effort, format: { type: "json_schema", schema } },
    messages,
  });
  if (response.stop_reason === "refusal") throw new Error("declined");
  if (response.stop_reason === "max_tokens") throw new Error("truncated");
  return { data: JSON.parse(textOf(response)), provider: "claude", model: response.model };
}

async function ollamaJSON({ system, messages }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const transcript = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${system}\n\n${transcript}\n\nRespond with JSON only.`,
        format: "json",
        stream: false,
        think: false,
        options: { temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return { data: JSON.parse(data.response), provider: "ollama", model: OLLAMA_MODEL };
  } finally {
    clearTimeout(timer);
  }
}

// Returns { data, provider, model } or null when no model is available or the call fails,
// in which case the caller serves its deterministic rules-based answer instead.
export async function generateJSON({ system, messages, schema, effort = "low", cacheSystem = false }) {
  try {
    if (getClaude()) return await claudeJSON({ system, messages, schema, effort, cacheSystem });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) console.warn("[ai] Claude rate limited — using fallback");
    else if (err instanceof Anthropic.APIError) console.warn(`[ai] Claude API error ${err.status} — using fallback`);
    else console.warn(`[ai] Claude call failed (${err.message}) — using fallback`);
  }
  try {
    if (OLLAMA_URL) return await ollamaJSON({ system, messages });
  } catch (err) {
    console.warn(`[ai] Ollama unavailable (${err.message}) — using rules`);
  }
  return null;
}
