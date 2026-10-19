import { ok, fail, readJson } from "@/lib/http";
import { getPublicHospitals } from "@/lib/data";
import { treatmentBySlug } from "@/content/treatments";

// Transparent scoring — every point awarded comes with a human-readable reason.
export async function POST(request) {
  const body = await readJson(request);
  const treatment = treatmentBySlug(body.treatmentSlug);
  const specialty = treatment?.specialty || String(body.specialty || "");
  if (!specialty) return fail("Choose a treatment or specialty.");
  const budget = Number(body.maxBudget) || null;
  const minRating = Number(body.minRating) || 0;
  const destination = String(body.destination || "");
  const language = String(body.language || "");
  const weights = { price: 1, quality: 1, speed: 1, ...(body.priorities || {}) };

  const matches = getPublicHospitals()
    .filter((h) => h.specialties.includes(specialty))
    .filter((h) => !minRating || (h.rating || 0) >= minRating)
    .map((h) => {
      let score = 30;
      const reasons = [{ text: `Offers ${specialty}`, tone: "good" }];
      const range = treatment?.prices?.[h.country] || null;
      if (budget && range) {
        if (range[1] <= budget) {
          score += 25 * weights.price;
          reasons.push({ text: "Typical range within your budget", tone: "good" });
        } else if (range[0] <= budget) {
          score += 12 * weights.price;
          reasons.push({ text: "Budget covers the lower end of the typical range", tone: "neutral" });
        } else {
          score -= 20 * weights.price;
          reasons.push({ text: "Typical range is above your budget", tone: "warn" });
        }
      } else if (range) {
        score += Math.max(0, 12 - range[0] / 2500) * weights.price;
      }
      if (destination && destination !== "any") {
        if (h.country === destination) {
          score += 15;
          reasons.push({ text: `In ${h.country}, your preferred destination`, tone: "good" });
        } else score -= 10;
      }
      if (h.rating) {
        score += (h.rating - 3) * 10 * weights.quality;
        if (h.rating >= 4.5) reasons.push({ text: `${h.rating.toFixed(1)}★ from ${h.reviewCount} review${h.reviewCount === 1 ? "" : "s"}`, tone: "good" });
      }
      if (h.accreditations.includes("JCI")) {
        score += 5 * weights.quality;
        reasons.push({ text: "JCI accredited", tone: "good" });
      }
      if (language) {
        if (h.languages.includes(language)) {
          score += 10;
          reasons.push({ text: `${language}-speaking staff`, tone: "good" });
        } else reasons.push({ text: `No listed ${language} interpreters`, tone: "warn" });
      }
      if (h.responseHours) {
        score += Math.max(0, 10 - h.responseHours / 3) * weights.speed;
        if (h.responseHours <= 12) reasons.push({ text: `Replies in ~${h.responseHours}h`, tone: "good" });
      }
      return { hospital: h, score: Math.max(0, Math.min(100, Math.round(score))), reasons, range };
    })
    .sort((a, b) => b.score - a.score);
  return ok({ matches, specialty, treatment: treatment ? { slug: treatment.slug, name: treatment.name } : null });
}
