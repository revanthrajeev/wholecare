// Deterministic fallbacks so AI features still work with no model configured.
// They organise what the patient wrote — they never interpret symptoms.
import { TREATMENTS, treatmentBySlug, priceSummary } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";

const SPECIALTY_KEYWORDS = [
  ["Cardiac Surgery", ["heart", "cardiac", "bypass", "cabg", "angiogram", "angioplasty", "stent", "valve", "coronary", "arrhythmia"]],
  ["Spine Surgery", ["spine", "spinal", "back pain", "disc", "lumbar", "cervical", "sciatica", "spondylolisthesis", "fusion"]],
  ["Orthopedics", ["knee", "hip", "joint", "arthritis", "acl", "ligament", "shoulder", "fracture", "orthopaedic", "orthopedic"]],
  ["Oncology", ["cancer", "tumor", "tumour", "oncology", "chemo", "lymphoma", "leukemia", "leukaemia", "malignant", "radiotherapy", "metasta"]],
  ["Transplant Surgery", ["transplant", "dialysis", "kidney failure", "liver failure", "cirrhosis", "donor"]],
  ["Neurosurgery", ["brain", "neuro", "seizure", "epilepsy", "aneurysm", "parkinson"]],
  ["Fertility (IVF)", ["ivf", "fertility", "infertility", "iui", "icsi", "conceive", "egg freezing"]],
  ["Bariatric Surgery", ["obesity", "bariatric", "weight loss", "gastric sleeve", "gastric bypass", "bmi"]],
  ["Ophthalmology", ["cataract", "eye", "lasik", "vision", "retina", "glaucoma"]],
  ["Dental", ["tooth", "teeth", "dental", "implant", "veneer", "denture", "all-on-4"]],
  ["Cosmetic Surgery", ["rhinoplasty", "nose job", "liposuction", "tummy tuck", "facelift", "breast", "cosmetic", "aesthetic", "bbl"]],
  ["Hair Restoration", ["hair", "baldness", "fue", "dhi", "receding"]],
];

const URGENT_WORDS = ["chest pain", "severe pain", "bleeding", "can't breathe", "cannot breathe", "unconscious", "stroke", "emergency", "suicid", "rapidly worsening"];
const PRIORITY_SPECIALTIES = ["Oncology", "Transplant Surgery", "Neurosurgery", "Cardiac Surgery"];

const SPECIALTY_DOCS = {
  "Cardiac Surgery": ["Recent angiogram report (and CD if available)", "Echocardiogram report", "ECG and recent blood tests"],
  Orthopedics: ["Recent X-ray of the affected joint", "MRI report if done", "List of current medications"],
  "Spine Surgery": ["MRI of the spine (report and images)", "Nerve conduction study if done"],
  Oncology: ["Biopsy and pathology report", "Staging scans (PET-CT or CT) with reports", "Treatment received so far"],
  "Transplant Surgery": ["Recent liver or kidney function tests", "Donor identity and relationship documents", "Imaging reports"],
  Neurosurgery: ["MRI/CT brain or spine with reports", "Neurologist's notes"],
  "Fertility (IVF)": ["Hormone tests (AMH, FSH, LH)", "Partner's semen analysis", "Ultrasound reports and previous cycle notes"],
  "Bariatric Surgery": ["Height, weight and BMI", "Blood tests incl. HbA1c and thyroid", "List of related conditions (diabetes, sleep apnoea)"],
  Ophthalmology: ["Recent eye examination report", "Biometry/lens measurements if done"],
  Dental: ["Panoramic X-ray (OPG) or CBCT scan", "Photos of current teeth"],
  "Cosmetic Surgery": ["Clear photos of the area (front and side)", "General health history"],
  "Hair Restoration": ["Photos of the scalp (front, top, crown)", "Family history of hair loss"],
};

const GENERIC_QUESTIONS = [
  "What are all my treatment options, including non-surgical ones?",
  "How many of these procedures does the team perform each year?",
  "How long will I need to stay in-country before flying home?",
  "What follow-up will I need once I'm back home?",
];

const lower = (s) => (s || "").toLowerCase();

export function detectSpecialty(text) {
  const t = lower(text);
  let best = null;
  let bestHits = 0;
  for (const [name, words] of SPECIALTY_KEYWORDS) {
    const hits = words.filter((w) => t.includes(w)).length;
    if (hits > bestHits) {
      best = name;
      bestHits = hits;
    }
  }
  return best;
}

export function caseSummaryRules(c, fileCount = 0) {
  const text = `${c.condition} ${c.existingTreatment} ${c.questions || ""}`;
  const specialty = c.specialty || detectSpecialty(text) || "General assessment";
  const t = lower(text);
  const triagePriority = URGENT_WORDS.some((w) => t.includes(w))
    ? "Urgent — recommend immediate coordinator review"
    : PRIORITY_SPECIALTIES.includes(specialty)
      ? "Priority"
      : "Routine";
  const missing = [];
  if (!fileCount) missing.push("Recent medical reports or imaging (none uploaded yet)");
  if (!c.patientAge) missing.push("Patient age");
  if (!c.budgetRange) missing.push("Budget range");
  if (!c.timeline) missing.push("Preferred timeline");
  for (const d of SPECIALTY_DOCS[specialty] || []) if (missing.length < 7) missing.push(d);
  const treatment = treatmentBySlug(c.treatmentSlug);
  const parts = [
    `${c.patientName || "The patient"}${c.patientAge ? `, ${c.patientAge},` : ""} from ${c.countryOfResidence || "an unspecified country"} reports: "${(c.condition || "").trim()}".`,
    c.existingTreatment ? `Care so far: ${c.existingTreatment.trim()}` : "No prior treatment details provided.",
    `Requested: ${treatment ? treatment.name : specialty}${c.preferredDestination ? ` in ${c.preferredDestination}` : ""}${c.timeline ? `, ${c.timeline.toLowerCase()}` : ""}.`,
  ];
  return {
    structuredSummary: parts.join(" "),
    suggestedSpecialty: specialty,
    triagePriority,
    missingInformation: missing,
    suggestedQuestionsForDoctor: (treatment?.questions || GENERIC_QUESTIONS).slice(0, 5),
  };
}

const QUESTION_BUCKETS = [
  ["Cost", ["cost", "price", "pay", "insurance", "budget", "$", "expensive", "cheap", "fee"]],
  ["Travel", ["fly", "flight", "travel", "visa", "hotel", "airport", "home", "companion", "family"]],
  ["Risks", ["risk", "safe", "complication", "danger", "age", "side effect", "infection"]],
  ["Recovery", ["recover", "stay", "walk", "rest", "weeks", "days", "back to work", "physio", "pain after"]],
  ["Alternatives", ["alternative", "instead", "option", "avoid", "injection", "without surgery", "delay"]],
  ["Follow-up", ["follow", "check-up", "checkup", "local doctor", "after i return", "stitches", "monitor"]],
  ["Treatment", ["surgery", "operation", "procedure", "implant", "technique", "robot", "anaesthe", "anesthe", "surgeon"]],
  ["Diagnosis", ["diagnos", "test", "scan", "report", "mri", "x-ray", "sure", "stage"]],
];

export function organizeQuestionsRules(raw) {
  const pieces = (raw || "")
    .split(/[\n?]+|(?<=[.!])\s+/)
    .map((s) => s.replace(/^[\s,;:-]*(and|also|plus)?\s*/i, "").trim())
    .filter((s) => s.length > 3);
  const out = new Map();
  for (const p of pieces) {
    const l = lower(p);
    const bucket = QUESTION_BUCKETS.find(([, words]) => words.some((w) => l.includes(w)))?.[0] || "Treatment";
    let q = p.replace(/[.!]+$/, "");
    q = q.charAt(0).toUpperCase() + q.slice(1);
    if (!/[?]$/.test(q)) q += "?";
    if (!out.has(bucket)) out.set(bucket, []);
    out.get(bucket).push(q);
  }
  const order = ["Diagnosis", "Treatment", "Alternatives", "Recovery", "Risks", "Travel", "Cost", "Follow-up"];
  return { categories: order.filter((n) => out.has(n)).map((name) => ({ name, questions: out.get(name) })) };
}

/* ---------- Assistant ---------- */
const fmt = (n) => `$${n.toLocaleString("en-US")}`;

function findTreatment(t) {
  let best = null;
  let bestScore = 0;
  for (const tr of TREATMENTS) {
    const words = `${tr.name} ${tr.slug.replace(/-/g, " ")}`.toLowerCase().split(/[\s(),]+/).filter((w) => w.length > 3);
    const score = words.filter((w) => t.includes(w)).length;
    if (score > bestScore) {
      best = tr;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

export function assistantRules(message) {
  const t = lower(message);
  if (URGENT_WORDS.some((w) => t.includes(w))) {
    return {
      reply: "If this is an emergency, please contact your local emergency number or go to the nearest emergency department now. I can't assess symptoms — once you're safe, a Whole Care coordinator can help you plan next steps.",
      actions: [{ label: "Contact a coordinator", href: "/contact" }],
    };
  }
  if (/\b(should i|do i need|is it (serious|cancer|normal)|what (is wrong|disease)|diagnos)/.test(t)) {
    return {
      reply: "I can't give medical advice or a diagnosis. The quickest way to a clear answer is a specialist review — book a video consult, or request a written second opinion with your reports.",
      actions: [
        { label: "Book a video consult", href: "/consult" },
        { label: "Get a second opinion", href: "/second-opinion" },
      ],
    };
  }
  const treatment = findTreatment(t);
  const destination = DESTINATIONS.find((d) => t.includes(d.country.toLowerCase()) || d.cities.some((c) => t.includes(c.name.toLowerCase())));
  if (treatment) {
    if (treatment.priceOnAssessment) {
      return {
        reply: `${treatment.name}: costs depend on the diagnosis and plan, so hospitals price it after a records review. You can start with a tumour-board review of your reports.`,
        actions: [
          { label: "Request a review", href: "/second-opinion" },
          { label: `About ${treatment.name}`, href: `/treatments/${treatment.slug}` },
        ],
      };
    }
    const s = priceSummary(treatment);
    const dest = destination && treatment.prices[destination.country];
    const lines = dest
      ? `In ${destination.country}, ${treatment.name} typically ranges ${fmt(dest[0])}–${fmt(dest[1])}.`
      : `${treatment.name} starts from about ${fmt(s.fromUSD)}; lowest typical range is in ${s.cheapestCountry} (${fmt(s.cheapestRange[0])}–${fmt(s.cheapestRange[1])}).`;
    return {
      reply: `${lines} Hospital stay is usually ${treatment.hospitalStay.toLowerCase()}, with ${treatment.inCountry.toLowerCase()} in-country. These are indicative ranges — a hospital quote after reviewing your reports is the real number.`,
      actions: [
        { label: "Get a free quote", href: `/get-quote?treatment=${treatment.slug}` },
        { label: "Compare destinations", href: `/countries/compare?treatment=${treatment.slug}` },
        { label: "Treatment details", href: `/treatments/${treatment.slug}` },
      ],
    };
  }
  if (/visa|invitation letter|e-medical/.test(t)) {
    const d = destination;
    return {
      reply: d
        ? `${d.country}: ${d.visa.type}. ${d.visa.notes} Rules change, so confirm on the official portal before booking.`
        : "Most destinations need a letter from the treating hospital for a medical visa — partner hospitals issue it once they accept your case, and you can request it from your case room.",
      actions: [
        { label: "Medical visa guide", href: "/guides/medical-visa-basics" },
        ...(d ? [{ label: `${d.country} guide`, href: `/countries/${d.slug}` }] : []),
      ],
    };
  }
  if (destination) {
    return {
      reply: `${destination.country}: ${destination.tagline} Strong in ${destination.strengths.slice(0, 3).join(", ")}. Best time to travel: ${destination.bestTime}.`,
      actions: [
        { label: `${destination.country} guide`, href: `/countries/${destination.slug}` },
        { label: "Hospitals there", href: `/hospitals?country=${encodeURIComponent(destination.country)}` },
      ],
    };
  }
  if (/second opinion|review my (report|scan)/.test(t)) {
    return { reply: "A written second opinion is reviewed by a specialist using your reports, with answers to your questions. Upload reports and your questions — your coordinator assigns the right specialist.", actions: [{ label: "Request a second opinion", href: "/second-opinion" }] };
  }
  if (/video|consult|talk to (a )?(doctor|surgeon)|appointment/.test(t)) {
    return { reply: "You can book a video consultation with a specialist before deciding anything. Each doctor's fee is shown before you book.", actions: [{ label: "Book a video consult", href: "/consult" }, { label: "Browse doctors", href: "/doctors" }] };
  }
  if (/safe|accredit|verify|trust|jci|nabh|scam/.test(t)) {
    return { reply: "Every hospital passes a verification checklist (licence, accreditation, international desk, and site visit where possible) before it appears, and each profile shows what was checked and when.", actions: [{ label: "How we verify hospitals", href: "/about#verification" }, { label: "Accreditation guide", href: "/guides/understanding-hospital-accreditation" }] };
  }
  if (/cost|price|how much|cheap|budget|afford/.test(t)) {
    return { reply: "Which procedure are you considering? Tell me (for example, “knee replacement in India”) and I'll share typical price ranges. The cost calculator adds travel and stay too.", actions: [{ label: "Cost calculator", href: "/calculator" }, { label: "All treatment prices", href: "/treatments" }] };
  }
  if (/human|person|agent|coordinator|call me|whatsapp|contact|phone/.test(t)) {
    return { reply: "A Whole Care coordinator can help directly — leave your details and they'll get back to you.", actions: [{ label: "Contact a coordinator", href: "/contact" }] };
  }
  return {
    reply: "I can help you compare treatment prices across countries, explain visas and travel, or point you to hospitals and doctors. What procedure or destination are you thinking about?",
    actions: [
      { label: "Get a free quote", href: "/get-quote" },
      { label: "Browse treatments", href: "/treatments" },
    ],
  };
}
