const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

export async function askOllamaJSON(prompt, { timeoutMs = 25000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        prompt,
        format: "json",
        stream: false,
        think: false,
        options: { temperature: 0.2 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.response);
  } finally {
    clearTimeout(timer);
  }
}
