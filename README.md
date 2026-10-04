# Whole Care — MVP

Cross-border healthcare case coordination platform: patient case flow, hospital portal, verified directory, cost calculator, and AI-assisted case coordination.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Netlify

This repo includes `netlify.toml` (build command `npm run build`, `@netlify/plugin-nextjs`). Connect the repo in Netlify and it should deploy with no extra config.

Two things behave differently in production vs. local dev:

1. **Data storage.** Locally, case/hospital/quotation data is stored in `data/db.json` (gitignored, seeded from `data/seed.json`) so it survives dev-server restarts. On Netlify, serverless functions can't write to the deployed project directory — `src/lib/db.js` detects this (`NETLIFY` / `AWS_LAMBDA_FUNCTION_NAME` env vars, which Netlify sets automatically) and falls back to `/tmp`. That keeps the demo functional, but data resets whenever the function container recycles — fine for a demo, not for anything that needs to persist.

2. **AI features.** The AI Case Summary and "Ask the Doctor" question organizer call a local [Ollama](https://ollama.com) instance at `OLLAMA_URL` (default `http://localhost:11434`, model `qwen3:8b` via `OLLAMA_MODEL`). Netlify's servers can't reach your laptop's Ollama — those two features will show "AI assistant is unavailable" in production unless you point `OLLAMA_URL` (set as a Netlify environment variable) at a publicly reachable Ollama instance, or swap `src/lib/ai.js` for a hosted model API. Nothing else on the site depends on them.
