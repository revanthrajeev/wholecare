import { ok, fail, readJson, clean, rateLimit } from "@/lib/http";
import { mutateDb, newId } from "@/lib/db";
import { hashPassword, createSession, passwordProblem, publicUser } from "@/lib/auth";
import { notifyStaff } from "@/lib/notify";
import { SPECIALTIES } from "@/content/specialties";
import { DESTINATIONS } from "@/content/destinations";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request) {
  if (!(await rateLimit("signup-hospital", { limit: 5, windowMs: 60 * 60 * 1000 }))) return fail("Too many sign-ups — try again later.", 429);
  const body = await readJson(request);
  const email = clean(body.email, 200).toLowerCase();
  const password = String(body.password || "");
  const name = clean(body.name, 160);
  const city = clean(body.city, 80);
  const country = clean(body.country, 80);
  const specialties = (Array.isArray(body.specialties) ? body.specialties : String(body.specialties || "").split(","))
    .map((s) => s.trim())
    .filter((s) => SPECIALTIES.some((x) => x.name === s));
  const accreditations = (Array.isArray(body.accreditations) ? body.accreditations : String(body.accreditation || "").split(","))
    .map((s) => clean(s, 60))
    .filter(Boolean)
    .slice(0, 5);
  if (!name || !city || !country) return fail("Hospital name, city and country are required.");
  if (!specialties.length) return fail("Choose at least one specialty.");
  if (!EMAIL.test(email)) return fail("Please enter a valid contact email.");
  const problem = passwordProblem(password);
  if (problem) return fail(problem);

  const result = mutateDb((db) => {
    db.users = db.users || [];
    if (db.users.some((u) => u.email === email)) return { error: "An account with this email already exists.", status: 409 };
    const id = newId("h");
    let slug = slugify(name);
    if (db.hospitals.some((h) => h.slug === slug)) slug = `${slug}-${id.slice(-4)}`;
    const dest = DESTINATIONS.find((d) => d.country.toLowerCase() === country.toLowerCase());
    const hospital = {
      id,
      slug,
      name,
      city,
      country: dest?.country || country,
      lat: dest?.hub.lat ?? 0,
      lng: dest?.hub.lng ?? 0,
      accreditations: accreditations.length ? accreditations : ["Pending review"],
      accreditation: accreditations.join(" · ") || "Pending review",
      specialties,
      languages: ["English"],
      beds: Math.max(0, Math.round(Number(body.beds) || 0)) || null,
      established: Math.round(Number(body.established) || 0) || null,
      services: ["Interpreters"],
      description: clean(body.description, 600) || `${name} in ${city}.`,
      highlights: [],
      image: null,
      verified: false,
      lastVerified: null,
      verification: { license: false, accreditation: false, intlDesk: false, siteVisit: false, notes: "" },
      responseHours: null,
      sample: false,
      intlPatientDept: true,
      contactEmail: email,
      createdAt: new Date().toISOString(),
    };
    db.hospitals.push(hospital);
    const user = { id: newId("user"), role: "hospital", hospitalId: id, name, email, passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
    db.users.push(user);
    notifyStaff(db, { message: `New hospital awaiting verification: ${name} (${city}, ${hospital.country})`, link: "/admin?tab=hospitals" });
    return { user };
  });
  if (result.error) return fail(result.error, result.status);
  await createSession(result.user.id);
  return ok(publicUser(result.user), 201);
}
