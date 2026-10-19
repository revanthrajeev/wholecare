import { readDb } from "@/lib/db";

export function ratingsByHospital(db) {
  const out = {};
  for (const r of db.reviews || []) {
    if (r.status !== "published") continue;
    const e = (out[r.hospitalId] ||= { sum: 0, count: 0 });
    e.sum += r.rating;
    e.count += 1;
  }
  for (const k of Object.keys(out)) out[k] = { rating: Math.round((out[k].sum / out[k].count) * 10) / 10, reviewCount: out[k].count };
  return out;
}

function decorateHospital(h, ratings, db) {
  const r = ratings[h.id] || { rating: null, reviewCount: 0 };
  const doctorCount = (db.doctors || []).filter((d) => d.hospitalId === h.id).length;
  // Public shape: no direct contact details or internal verification notes.
  const { contactEmail, verification, ...pub } = h;
  const { notes, requestedAt, ...checks } = verification || {};
  return { ...pub, verification: checks, ...r, doctorCount };
}

export function getPublicHospitals(db = readDb()) {
  const ratings = ratingsByHospital(db);
  return db.hospitals.filter((h) => h.verified).map((h) => decorateHospital(h, ratings, db));
}

export function getHospitalBySlug(slug, db = readDb()) {
  const h = db.hospitals.find((x) => x.slug === slug || x.id === slug);
  if (!h || !h.verified) return null;
  return decorateHospital(h, ratingsByHospital(db), db);
}

export function getPublicDoctors(db = readDb()) {
  const hospitals = Object.fromEntries(getPublicHospitals(db).map((h) => [h.id, h]));
  return (db.doctors || [])
    .filter((d) => hospitals[d.hospitalId])
    .map((d) => ({ ...d, hospital: pickHospital(hospitals[d.hospitalId]) }));
}

export function getDoctorBySlug(slug, db = readDb()) {
  return getPublicDoctors(db).find((d) => d.slug === slug || d.id === slug) || null;
}

export function getPublicPackages(db = readDb()) {
  const hospitals = Object.fromEntries(getPublicHospitals(db).map((h) => [h.id, h]));
  return (db.packages || []).filter((p) => p.active && hospitals[p.hospitalId]).map((p) => ({ ...p, hospital: pickHospital(hospitals[p.hospitalId]) }));
}

export function getPublishedReviews(db = readDb(), hospitalId) {
  return (db.reviews || [])
    .filter((r) => r.status === "published" && (!hospitalId || r.hospitalId === hospitalId))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function pickHospital(h) {
  if (!h) return null;
  const { id, slug, name, city, country, accreditations, image, rating, reviewCount, verified, sample, lat, lng } = h;
  return { id, slug, name, city, country, accreditations, image, rating, reviewCount, verified, sample, lat, lng };
}
