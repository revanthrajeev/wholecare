import { TREATMENTS } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";
import { GUIDES } from "@/content/guides";
import { getPublicDoctors, getPublicHospitals } from "@/lib/data";

export const revalidate = 3600;

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const STATIC = [
  ["", 1, "weekly"],
  ["/treatments", 0.9, "weekly"],
  ["/hospitals", 0.9, "daily"],
  ["/doctors", 0.8, "daily"],
  ["/countries", 0.8, "monthly"],
  ["/countries/compare", 0.6, "monthly"],
  ["/get-quote", 0.9, "monthly"],
  ["/second-opinion", 0.8, "monthly"],
  ["/consult", 0.7, "weekly"],
  ["/packages", 0.7, "weekly"],
  ["/calculator", 0.8, "monthly"],
  ["/match", 0.7, "monthly"],
  ["/guides", 0.7, "weekly"],
  ["/about", 0.5, "monthly"],
  ["/for-hospitals", 0.6, "monthly"],
  ["/contact", 0.4, "yearly"],
  ["/legal/terms", 0.2, "yearly"],
  ["/legal/privacy", 0.2, "yearly"],
  ["/legal/medical-disclaimer", 0.2, "yearly"],
];

export default function sitemap() {
  const now = new Date();
  const entry = (path, priority, changeFrequency, lastModified = now) => ({ url: `${SITE}${path}`, lastModified, changeFrequency, priority });
  return [
    ...STATIC.map(([p, pr, f]) => entry(p, pr, f)),
    ...TREATMENTS.map((t) => entry(`/treatments/${t.slug}`, 0.8, "monthly")),
    ...DESTINATIONS.map((d) => entry(`/countries/${d.slug}`, 0.7, "monthly")),
    ...GUIDES.map((g) => entry(`/guides/${g.slug}`, 0.6, "monthly")),
    ...getPublicHospitals().map((h) => entry(`/hospitals/${h.slug}`, 0.7, "weekly", h.lastVerified ? new Date(h.lastVerified) : now)),
    ...getPublicDoctors().map((d) => entry(`/doctors/${d.slug}`, 0.6, "weekly")),
  ];
}
