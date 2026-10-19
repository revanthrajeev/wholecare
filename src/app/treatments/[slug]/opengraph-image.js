import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE } from "@/components/og/OgFrame";
import { TREATMENTS, priceSummary, treatmentBySlug } from "@/content/treatments";

export const alt = "Treatment prices compared across destinations";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TREATMENTS.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const t = treatmentBySlug(slug);
  const s = t ? priceSummary(t) : null;
  return new ImageResponse(
    <OgFrame
      eyebrow={t?.specialty || "Treatment"}
      title={t?.name || "Treatment abroad"}
      subtitle={s ? `From $${s.fromUSD.toLocaleString("en-US")} abroad${s.savingPct ? ` · typically ~${s.savingPct}% below US prices` : ""}` : "Personalised plans and quotes after specialist review"}
      chips={s ? [`${Object.keys(t.prices).length} destinations compared`, `Stay: ${t.inCountry}`, "Itemized quotes"] : ["Specialist review", "Itemized quotes"]}
    />,
    size
  );
}
