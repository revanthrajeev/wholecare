# Whole Care

Medical-travel coordination platform. Patients compare treatment prices across seven destinations, get specialist second opinions and itemized hospital quotes, book video consultations, and run their whole trip (documents, messages, travel, visa letter, recovery, family updates) from one case room. Hospitals work cases in their own portal; the Whole Care team runs operations from an admin console.

Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, framer-motion and react-three-fiber (3D globe).

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

The first request creates `data/db.json` from `data/seed.json`. Delete `data/db.json` (and `data/uploads/`) to reset the demo to its seed state. `node scripts/build-seed.mjs` regenerates the seed itself.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@wholecare.com | admin123 |
| Coordinator | care@wholecare.com | care123 |
| Patient (has cases in every stage) | demo.patient@wholecare.com | demo123 |
| Hospital (Apex Global, Bangalore) | apex@demo.com | demo123 |

Other hospital logins follow the same pattern (`sunrise@demo.com`, `meridyen@demo.com`, `lykia@demo.com` — unverified — and so on). The login page has one-click demo buttons.

## What's in the product

**Public site** — treatment price pages with charts and country comparison, verified hospital and doctor directories with side-by-side compare, destination guides, a true-cost calculator (treatment + flights + stay + food + visa + buffer, in 11 currencies, against self-pay prices at home), a hospital matcher that shows the reason behind every ranking, packages, patient guides, ⌘K search, an AI assistant, and a 3D globe of care corridors on the home page.

**Patients** — quote and second-opinion wizards with report upload (draft saved in the tab), a case room with overview, documents, quote comparison and acceptance (price-lock certificate), messages, video consultations with calendar invites, travel planning, hospital visa letter, recovery check-ins with charts, and a private family tracker link.

**Hospitals** (`/hospital`) — drag-and-drop case pipeline, a line-item quote builder with market-range guidance, a case workspace (documents, messages, internal notes, milestones, visa letters, travel and recovery after acceptance), consultation confirmation, response-time and acceptance analytics, and a self-serve profile editor with a verification request.

**Operations** (`/admin`) — funnel and demand charts, a "needs attention" queue, case assignment and stage control, the hospital verification checklist with publish/unpublish (admins only), consultations, inquiries inbox, review moderation, people, and the audit log.

## Configuration

Copy these into `.env.local` (or your host's environment settings). Everything is optional for a local demo.

| Variable | What it does |
|---|---|
| `SESSION_SECRET` | Signs session cookies. **Set a long random value in every deployed environment.** |
| `NEXT_PUBLIC_SITE_URL` | Public base URL — used in the sitemap, robots.txt, social previews and calendar invites. |
| `ANTHROPIC_API_KEY` | Turns on Claude for the assistant, case summaries and question organizer. |
| `ANTHROPIC_MODEL` | Optional model override (default `claude-opus-5-5`). |
| `OLLAMA_URL`, `OLLAMA_MODEL` | Optional local-model fallback (only used when `OLLAMA_URL` is set; default model `qwen3:8b`). |
| `NEXT_PUBLIC_VIDEO_BASE_URL` | Video-call server (default public Jitsi, `https://meet.jit.si`). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Shows WhatsApp contact buttons (digits with country code). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact address shown on the site. |

**AI** falls back in order: Claude → Ollama (if configured) → a built-in rules engine. The site works fully with no AI configured; the admin console shows which engine is answering. Nothing in the product gives a diagnosis — AI output is limited to organizing what the patient wrote and pointing to pages.

## Before real patients — read this

These are deliberate MVP shortcuts, not hidden problems:

- **Storage is a JSON file**, written atomically. On serverless hosts (Netlify, Vercel, Lambda) it lives in `/tmp` and resets whenever the instance recycles. Real patient data needs a proper database (e.g. Postgres with row-level security), encryption at rest, backups, and file storage for uploads (e.g. S3) with signed URLs.
- **Rate limiting is in memory**, per server instance. Use a shared store (e.g. Redis) once there is more than one instance.
- **Video** uses the public Jitsi server, which limits embedded calls. Point `NEXT_PUBLIC_VIDEO_BASE_URL` at a self-hosted Jitsi or a contracted video provider before clinical use.
- **All hospitals, doctors, packages and reviews are sample data** and are labelled "Sample" in the UI. Prices are indicative ranges, labelled as such.
- **Legal pages** (terms, privacy, medical disclaimer) are working drafts pending legal review.
- **English only.** Multilingual support needs a translation pipeline and locale routing.
- **Payments** are not processed on the platform; consultation and treatment fees are paid to hospitals.

## Checks

```bash
npm run lint     # ESLint, including React's hook and compiler rules
npm run build    # production build
```

## Project layout

```
src/app/            routes (pages, API route handlers, sitemap, robots, social images)
src/components/     UI — ui/ (design-system primitives), case/, hospital/, admin/, home/, globe/
src/content/        static content: treatments and prices, destinations, specialties, guides, FAQs
src/lib/            data access, auth and sessions, access control, AI providers, scheduling, trip costs
data/               seed.json (committed) and the runtime db.json (git-ignored)
scripts/            seed generator
```
