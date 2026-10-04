import { NextResponse } from "next/server";
import { askOllamaJSON } from "@/lib/ai";

export async function POST(request) {
  const { condition, rawQuestions } = await request.json();

  const prompt = `You are a pre-consultation assistant for a medical-tourism platform. A patient with this condition is preparing to speak with a specialist: "${condition}".

They wrote these free-form notes/questions:
"""
${rawQuestions}
"""

Organize their notes into clear, specific questions for the specialist, grouped under these exact category headers only: Diagnosis, Treatment, Alternatives, Recovery, Risks, Travel, Cost, Follow-up. Do NOT answer any of the questions yourself — you only organize and clarify wording. Omit a category if the patient wrote nothing relevant to it.

Return ONLY a JSON object with this exact shape, no other text:
{
  "categories": [
    { "name": "Diagnosis", "questions": ["..."] },
    { "name": "Treatment", "questions": ["..."] }
  ]
}`;

  try {
    const result = await askOllamaJSON(prompt);
    return NextResponse.json({ ...result, aiGenerated: true });
  } catch (err) {
    return NextResponse.json(
      { error: "AI assistant unavailable", detail: String(err?.message || err) },
      { status: 503 }
    );
  }
}
