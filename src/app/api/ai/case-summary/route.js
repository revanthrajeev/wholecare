import { NextResponse } from "next/server";
import { askOllamaJSON } from "@/lib/ai";

export async function POST(request) {
  const body = await request.json();
  const { patientName, condition, existingTreatment, budgetRange, timeline, countryOfResidence } = body;

  const prompt = `You are a clinical case-intake assistant for a medical-tourism coordination platform. You organize information for the care team to review — you are NOT a doctor and must NEVER diagnose, prescribe, or recommend a treatment decision.

Patient intake:
- Name: ${patientName}
- Country of residence: ${countryOfResidence}
- Stated condition/diagnosis (as the patient understands it): ${condition}
- Existing treatment/diagnosis from their own doctor: ${existingTreatment || "not provided"}
- Budget range: ${budgetRange || "not provided"}
- Timeline: ${timeline || "not provided"}

Return ONLY a JSON object with this exact shape, no other text:
{
  "structuredSummary": "2-3 sentence neutral clinical-administrative summary of what the patient has reported, written for a care coordinator (not a diagnosis)",
  "suggestedSpecialty": "most likely relevant medical specialty based on the stated condition, as a single short string",
  "triagePriority": "Routine" | "Priority" | "Urgent — recommend immediate coordinator review",
  "missingInformation": ["list", "of", "specific missing fields or documents the coordinator should request from the patient"],
  "suggestedQuestionsForDoctor": ["3-5 clear questions the patient should ask a specialist about this condition"]
}`;

  try {
    const result = await askOllamaJSON(prompt);
    return NextResponse.json({ ...result, aiGenerated: true, model: process.env.OLLAMA_MODEL || "qwen3:8b" });
  } catch (err) {
    return NextResponse.json(
      { error: "AI assistant unavailable", detail: String(err?.message || err) },
      { status: 503 }
    );
  }
}
