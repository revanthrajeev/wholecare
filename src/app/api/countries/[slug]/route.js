import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(request, { params }) {
  const { slug } = await params;
  const db = readDb();
  const guide = (db.countryGuides || []).find((g) => g.slug === slug);
  if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hospitals = db.hospitals.filter((h) => h.country === guide.country);
  return NextResponse.json({ guide, hospitals });
}
