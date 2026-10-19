import { ImageResponse } from "next/og";
import { OgFrame, OG_SIZE } from "@/components/og/OgFrame";
import { TREATMENTS } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";

export const alt = "Whole Care — coordinated medical travel, from first opinion to full recovery";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgFrame
      eyebrow="Medical travel, coordinated"
      title="From first opinion to full recovery — in one case room."
      subtitle="Specialist second opinions, itemized price-locked quotes, travel planning and aftercare."
      chips={[`${DESTINATIONS.length} destinations`, `${TREATMENTS.length} treatments priced`, "Free for patients"]}
    />,
    size
  );
}
