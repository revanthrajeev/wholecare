import { ok } from "@/lib/http";
import { getPublicDoctors } from "@/lib/data";

export async function GET() {
  return ok(getPublicDoctors());
}
