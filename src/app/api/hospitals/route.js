import { ok } from "@/lib/http";
import { getPublicHospitals } from "@/lib/data";

export async function GET() {
  return ok(getPublicHospitals());
}
