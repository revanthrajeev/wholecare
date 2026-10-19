import { ok, fail } from "@/lib/http";
import { getPublicHospitals } from "@/lib/data";
import { destinationBySlug } from "@/content/destinations";

export async function GET(request, { params }) {
  const { slug } = await params;
  const guide = destinationBySlug(slug);
  if (!guide) return fail("Not found", 404);
  return ok({ guide, hospitals: getPublicHospitals().filter((h) => h.country === guide.country) });
}
