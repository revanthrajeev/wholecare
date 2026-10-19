import { ok } from "@/lib/http";
import { FAQS } from "@/content/faqs";

export async function GET() {
  return ok(FAQS);
}
