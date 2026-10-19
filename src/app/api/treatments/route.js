import { ok } from "@/lib/http";
import { TREATMENTS } from "@/content/treatments";

export async function GET() {
  return ok(TREATMENTS);
}
