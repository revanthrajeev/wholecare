import { NextResponse } from "next/server";
import { getPublicHospitals, getPublicDoctors } from "@/lib/data";
import { TREATMENTS } from "@/content/treatments";
import { DESTINATIONS } from "@/content/destinations";
import { GUIDES } from "@/content/guides";
import { SPECIALTIES } from "@/content/specialties";

const PAGES = [
  ["Get a free quote", "/get-quote", "quote request records upload"],
  ["Second opinion", "/second-opinion", "specialist review written opinion"],
  ["Video consultation", "/consult", "book doctor call telemedicine"],
  ["Cost calculator", "/calculator", "estimate budget travel"],
  ["Compare destinations", "/countries/compare", "country comparison price"],
  ["Packages", "/packages", "all inclusive bundle deals"],
  ["Find my match", "/match", "recommend hospital ranking"],
  ["For hospitals", "/for-hospitals", "crm partner international desk"],
  ["Contact a coordinator", "/contact", "help support whatsapp"],
];

export async function GET() {
  const hospitals = getPublicHospitals();
  const doctors = getPublicDoctors();
  const items = [
    ...TREATMENTS.map((t) => ({ type: "Treatment", title: t.name, subtitle: t.specialty, href: `/treatments/${t.slug}`, keywords: t.summary })),
    ...SPECIALTIES.map((s) => ({ type: "Specialty", title: s.name, subtitle: s.blurb, href: `/treatments?specialty=${s.slug}`, keywords: s.blurb })),
    ...hospitals.map((h) => ({ type: "Hospital", title: h.name, subtitle: `${h.city}, ${h.country}`, href: `/hospitals/${h.slug}`, keywords: `${h.specialties.join(" ")} ${h.accreditations.join(" ")}` })),
    ...doctors.map((d) => ({ type: "Doctor", title: d.name, subtitle: `${d.specialty} · ${d.hospital.name}`, href: `/doctors/${d.slug}`, keywords: `${d.procedures.join(" ")} ${d.languages.join(" ")}` })),
    ...DESTINATIONS.map((d) => ({ type: "Destination", title: d.country, subtitle: d.tagline, href: `/countries/${d.slug}`, keywords: `${d.cities.map((c) => c.name).join(" ")} ${d.strengths.join(" ")}` })),
    ...GUIDES.map((g) => ({ type: "Guide", title: g.title, subtitle: g.category, href: `/guides/${g.slug}`, keywords: g.excerpt })),
    ...PAGES.map(([title, href, keywords]) => ({ type: "Page", title, subtitle: "", href, keywords })),
  ];
  return NextResponse.json(items);
}
