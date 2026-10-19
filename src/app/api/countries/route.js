import { ok } from "@/lib/http";
import { DESTINATIONS } from "@/content/destinations";

export async function GET() {
  return ok(DESTINATIONS);
}
