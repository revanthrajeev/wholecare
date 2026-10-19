import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { icsForConsultation } from "@/lib/schedule";
import { canSeeConsultation } from "@/lib/access";
import { fail } from "@/lib/http";

export async function GET(request, { params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const c = (readDb().consultations || []).find((x) => x.id === id);
  if (!c || !canSeeConsultation(user, c)) return fail("Consultation not found.", 404);
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return new Response(icsForConsultation(c, site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="wholecare-consult-${c.date}.ics"`,
    },
  });
}
