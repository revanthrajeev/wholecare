import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

// Original scoring model: weights specialty fit, budget fit (against treatment
// cost ranges for that specialty), hospital rating, and destination city match.
export async function POST(request) {
  const body = await request.json();
  const specialty = (body.specialty || "").trim();
  const city = (body.city || "").trim().toLowerCase();
  const maxBudget = Number(body.maxBudget) || null;
  const minRating = Number(body.minRating) || 0;

  const db = readDb();

  const scored = db.hospitals
    .map((h) => {
      let score = 0;
      const reasons = [];

      const specialtyMatch = specialty && h.specialties.includes(specialty);
      if (specialtyMatch) {
        score += 40;
        reasons.push(`Offers ${specialty}`);
      } else if (specialty) {
        return null; // not a candidate at all if it doesn't offer the requested specialty
      }

      if (h.rating) {
        const ratingScore = Math.max(0, Math.min(25, (h.rating - 3) * 12.5));
        score += ratingScore;
        if (h.rating >= minRating) reasons.push(`${h.rating}★ rated (${h.reviewCount} reviews)`);
      }
      if (minRating && (!h.rating || h.rating < minRating)) {
        return null;
      }

      if (city) {
        if (h.city.toLowerCase().includes(city) || h.country.toLowerCase().includes(city)) {
          score += 15;
          reasons.push(`Located in ${h.city}`);
        }
      }

      if (maxBudget) {
        const relevantTreatments = db.treatments.filter((t) => !specialty || t.specialty === specialty);
        const affordable = relevantTreatments.some((t) => t.indiaCostLow <= maxBudget);
        if (affordable) {
          score += 20;
          reasons.push("Treatment cost fits your budget");
        } else if (relevantTreatments.length > 0) {
          score -= 15;
          reasons.push("May exceed your stated budget");
        }
      }

      if (h.verified) {
        score += 5;
        reasons.push("Verified accreditation");
      }

      return { hospital: h, score: Math.round(Math.max(0, score)), reasons };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ matches: scored });
}
