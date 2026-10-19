import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE } from "@/components/og/OgFrame";
import { DESTINATIONS, destinationBySlug } from "@/content/destinations";

export const alt = "Medical travel destination guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const d = destinationBySlug(slug);
  return new ImageResponse(
    <OgFrame eyebrow="Destination guide" title={d ? `Treatment in ${d.country}` : "Destination guide"} subtitle={d?.tagline} chips={d ? d.strengths.slice(0, 3) : []} />,
    size
  );
}
