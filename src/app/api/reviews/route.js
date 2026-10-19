import { ok, fail, readJson, clean } from "@/lib/http";
import { mutateDb, newId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedReviews } from "@/lib/data";
import { recordAudit } from "@/lib/audit";
import { notifyHospital, notifyStaff } from "@/lib/notify";
import { treatmentBySlug } from "@/content/treatments";

export async function GET(request) {
  const hospitalId = new URL(request.url).searchParams.get("hospitalId") || undefined;
  return ok(getPublishedReviews(undefined, hospitalId));
}

// Only a patient whose case at this hospital is completed can post — one review per case.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "patient") return fail("Sign in with the patient account that completed treatment.", 401);
  const body = await readJson(request);
  const rating = Math.round(Number(body.rating));
  const text = clean(body.text, 1200);
  if (!(rating >= 1 && rating <= 5)) return fail("Choose a rating from 1 to 5.");
  if (text.length < 20) return fail("Please write at least a couple of sentences.");

  const result = mutateDb((db) => {
    const c = db.cases.find((x) => x.id === body.caseId && x.ownerId === user.id);
    if (!c || c.stage !== "Completed" || !(c.sentToHospitals || []).includes(body.hospitalId)) return { error: "Reviews can only be written for completed cases.", status: 403 };
    if ((db.reviews || []).some((r) => r.caseId === c.id)) return { error: "You've already reviewed this case.", status: 409 };
    const review = {
      id: newId("rev"),
      hospitalId: body.hospitalId,
      caseId: c.id,
      authorId: user.id,
      author: `${(user.name || "Patient").split(" ")[0]} ${(user.name || "").split(" ").slice(-1)[0]?.[0] || ""}.`.trim(),
      country: c.countryOfResidence || user.country || "",
      rating,
      procedure: treatmentBySlug(c.treatmentSlug)?.name || c.specialty || "Treatment",
      text,
      date: new Date().toISOString().slice(0, 10),
      verified: true,
      sample: false,
      status: "published",
    };
    db.reviews = db.reviews || [];
    db.reviews.push(review);
    notifyHospital(db, body.hospitalId, { message: `New ${rating}★ verified review from ${review.author}`, link: `/hospitals/${db.hospitals.find((h) => h.id === body.hospitalId)?.slug}#reviews` });
    notifyStaff(db, { message: `New verified review (${rating}★)`, link: "/admin?tab=reviews" });
    recordAudit(db, { userId: user.id, action: "review.created", targetId: review.id });
    return { review };
  });
  if (result.error) return fail(result.error, result.status);
  return ok(result.review, 201);
}
