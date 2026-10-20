// Builds data/seed.json (+ placeholder PDFs in data/seed-uploads/) for the demo.
// Every hospital, doctor, package and review here is SAMPLE data — the UI labels it so.
// Run: node scripts/build-seed.mjs
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_VERSION = 3;

function hash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const room = () => `wholecare-${crypto.randomBytes(9).toString("hex")}`;

const ALL_CHECKS = { license: true, accreditation: true, intlDesk: true, siteVisit: true };

const hospitals = [
  {
    id: "h1", name: "Apex Global Hospital", city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946,
    accreditations: ["JCI", "NABH"], specialties: ["Cardiac Surgery", "Orthopedics", "Oncology", "Spine Surgery"],
    languages: ["English", "Hindi", "Arabic", "Russian"], beds: 650, established: 2004,
    services: ["Airport pickup", "Interpreters", "Visa invitation letter", "Accommodation help", "Halal meals", "Prayer room", "International patient lounge"],
    description: "Multi-specialty tertiary hospital with a dedicated international patient department, known for its cardiac and joint-replacement programmes.",
    highlights: ["Hybrid cardiac operating theatres", "Robotic-assisted joint replacement", "On-site international patient lounge"],
    image: "/images/hospitals/hospital_1.jpg", verified: true, lastVerified: "2026-09-28", verification: { ...ALL_CHECKS }, responseHours: 18,
  },
  {
    id: "h2", name: "Sunrise Medicity", city: "Chennai", country: "India", lat: 13.0827, lng: 80.2707,
    accreditations: ["NABH"], specialties: ["Transplant Surgery", "Neurosurgery", "Orthopedics", "Cardiac Surgery"],
    languages: ["English", "Tamil", "Arabic", "Bengali"], beds: 520, established: 2009,
    services: ["Airport pickup", "Interpreters", "Visa invitation letter", "Accommodation help", "Halal meals"],
    description: "Transplant and neurosciences centre with a living-donor transplant programme and a dedicated transplant coordination team.",
    highlights: ["Living-donor liver and kidney transplant programme", "Neuro-navigation and intraoperative imaging", "Transplant committee paperwork support"],
    image: "/images/hospitals/hospital_2.jpg", verified: true, lastVerified: "2026-09-25", verification: { ...ALL_CHECKS }, responseHours: 26,
  },
  {
    id: "h3", name: "Horizon Speciality Centre", city: "Mumbai", country: "India", lat: 19.076, lng: 72.8777,
    accreditations: ["JCI", "NABH"], specialties: ["Fertility (IVF)", "Cosmetic Surgery", "Bariatric Surgery", "Ophthalmology"],
    languages: ["English", "Hindi", "Arabic", "French", "Bengali"], beds: 280, established: 2011,
    services: ["Airport pickup", "Interpreters", "Visa invitation letter", "Accommodation help", "Partner residency suites"],
    description: "Speciality centre focused on fertility, bariatric, eye and aesthetic procedures, with residency suites for longer stays.",
    highlights: ["In-house embryology lab", "Day-surgery suites", "Residency suites for IVF cycles"],
    image: "/images/hospitals/hospital_3.jpg", verified: true, lastVerified: "2026-09-30", verification: { ...ALL_CHECKS }, responseHours: 12,
  },
  {
    id: "h4", name: "Northstar Heart & Joint Institute", city: "Gurugram", country: "India", lat: 28.4595, lng: 77.0266,
    accreditations: ["JCI", "NABH"], specialties: ["Cardiac Surgery", "Orthopedics", "Spine Surgery", "Bariatric Surgery"],
    languages: ["English", "Hindi", "Arabic", "Russian", "Uzbek"], beds: 410, established: 2013,
    services: ["Airport pickup", "Interpreters", "Visa invitation letter", "Fast-track pre-op assessment", "Accommodation help"],
    description: "Heart and joint institute near Delhi's international airport, with fast-track pre-operative assessment for international patients.",
    highlights: ["Pre-op tests within 48 hours of arrival", "Off-pump bypass programme", "Minimally invasive spine unit"],
    image: "/images/hospitals/northstar-gurugram.jpg", verified: true, lastVerified: "2026-10-02", verification: { ...ALL_CHECKS }, responseHours: 10,
  },
  {
    id: "h5", name: "Meridyen Istanbul Hospital", city: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784,
    accreditations: ["JCI", "Ministry of Health licensed"], specialties: ["Hair Restoration", "Dental", "Cosmetic Surgery", "Bariatric Surgery", "Ophthalmology"],
    languages: ["Turkish", "English", "Arabic", "German", "Russian"], beds: 220, established: 2010,
    services: ["Airport pickup", "Interpreters", "Hotel desk", "Visa invitation letter"],
    description: "Aesthetic, dental and bariatric hospital on Istanbul's European side with an in-house transfer and hotel desk.",
    highlights: ["Surgeon-led hairline design", "In-house dental lab", "Bundled hotel and transfers"],
    image: "/images/hospitals/meridyen-istanbul.jpg", verified: true, lastVerified: "2026-09-18", verification: { ...ALL_CHECKS }, responseHours: 6,
  },
  {
    id: "h6", name: "Lykia Coast Medical", city: "Antalya", country: "Turkey", lat: 36.8969, lng: 30.7133,
    accreditations: ["Ministry of Health licensed"], specialties: ["Orthopedics", "Dental", "Ophthalmology", "Fertility (IVF)"],
    languages: ["Turkish", "English", "German", "Russian"], beds: 180, established: 2014,
    services: ["Airport pickup", "Interpreters", "Seaside recovery stays"],
    description: "Coastal hospital combining elective orthopaedic, eye and dental care with seaside recovery stays.",
    highlights: ["Seaside recovery residence", "Same-week cataract scheduling"],
    image: "/images/hospitals/lykia-antalya.jpg", verified: false, lastVerified: null, verification: { license: true, accreditation: false, intlDesk: true, siteVisit: false, notes: "Awaiting accreditation certificate upload." }, responseHours: null,
  },
  {
    id: "h7", name: "Lotus River International Hospital", city: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018,
    accreditations: ["JCI", "HA Thailand"], specialties: ["Cardiac Surgery", "Orthopedics", "Cosmetic Surgery", "Oncology", "Spine Surgery"],
    languages: ["Thai", "English", "Arabic", "Japanese", "Mandarin"], beds: 480, established: 2002,
    services: ["Airport pickup", "Interpreters", "Embassy liaison", "Visa invitation letter", "Halal meals"],
    description: "Bangkok international hospital with interpreters in more than a dozen languages and an embassy liaison desk.",
    highlights: ["Embassy liaison desk", "Hotel-style inpatient floors", "Dedicated Arabic-speaking team"],
    image: "/images/hospitals/lotus-river-bangkok.jpg", verified: true, lastVerified: "2026-09-21", verification: { ...ALL_CHECKS }, responseHours: 14,
  },
  {
    id: "h8", name: "Lumen Bay Medical Centre", city: "Singapore", country: "Singapore", lat: 1.2903, lng: 103.8519,
    accreditations: ["JCI", "MOH licensed"], specialties: ["Oncology", "Transplant Surgery", "Neurosurgery", "Cardiac Surgery"],
    languages: ["English", "Mandarin", "Malay", "Bahasa Indonesia"], beds: 350, established: 2008,
    services: ["Airport pickup", "Interpreters", "Tumour board reviews", "Visa support letter"],
    description: "Tertiary referral centre for complex oncology, neurosurgery and transplant, with weekly multidisciplinary tumour boards.",
    highlights: ["Weekly multidisciplinary tumour board", "Image-guided neurosurgery suites", "Remote records review before travel"],
    image: "/images/hospitals/lumen-bay-singapore.jpg", verified: true, lastVerified: "2026-09-29", verification: { ...ALL_CHECKS }, responseHours: 20,
  },
  {
    id: "h9", name: "Pacifica Frontera Medical", city: "Tijuana", country: "Mexico", lat: 32.5149, lng: -117.0382,
    accreditations: ["CSG certified"], specialties: ["Bariatric Surgery", "Dental", "Cosmetic Surgery", "Orthopedics"],
    languages: ["Spanish", "English"], beds: 120, established: 2012,
    services: ["San Diego airport shuttle", "Interpreters", "Recovery hotel", "Dietitian follow-up"],
    description: "Border-city hospital about 20 minutes from San Diego, with bariatric, dental and aesthetic programmes and a cross-border shuttle.",
    highlights: ["Cross-border shuttle from San Diego", "Six-month dietitian follow-up", "Same-time-zone care for the US West Coast"],
    image: "/images/hospitals/pacifica-tijuana.jpg", verified: true, lastVerified: "2026-09-24", verification: { ...ALL_CHECKS }, responseHours: 8,
  },
  {
    id: "h10", name: "Crescent Palm Hospital", city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708,
    accreditations: ["JCI", "DHA licensed"], specialties: ["Orthopedics", "Fertility (IVF)", "Cardiac Surgery", "Ophthalmology"],
    languages: ["Arabic", "English", "Hindi", "Urdu", "Russian"], beds: 300, established: 2015,
    services: ["Airport pickup", "Interpreters", "Medical visa sponsorship", "Family suites"],
    description: "Premium Dubai hospital for patients who want international-standard care closer to home in the GCC.",
    highlights: ["Family suites", "Sports medicine and joint unit", "Medical visa sponsorship"],
    image: "/images/hospitals/crescent-palm-dubai.jpg", verified: true, lastVerified: "2026-10-05", verification: { ...ALL_CHECKS }, responseHours: 9,
  },
  {
    id: "h11", name: "Seri Kenanga Specialist Hospital", city: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869,
    accreditations: ["MSQH", "JCI"], specialties: ["Cardiac Surgery", "Fertility (IVF)", "Orthopedics", "Oncology"],
    languages: ["Malay", "English", "Mandarin", "Arabic", "Bahasa Indonesia"], beds: 390, established: 2006,
    services: ["Airport pickup", "Interpreters", "Visa support letter", "Halal meals", "Prayer room"],
    description: "Kuala Lumpur specialist hospital known for fertility and cardiac care, popular with Indonesian and Middle Eastern patients.",
    highlights: ["Fertility monitoring can start at home", "Muslim-friendly facilities", "Cardiac rehab gym"],
    image: "/images/hospitals/seri-kenanga-kuala-lumpur.jpg", verified: true, lastVerified: "2026-09-27", verification: { ...ALL_CHECKS }, responseHours: 16,
  },
].map((h) => ({ ...h, slug: slugify(h.name), accreditation: h.accreditations.join(" · "), sample: true, intlPatientDept: true, contactEmail: null, createdAt: "2026-09-01T00:00:00.000Z" }));

const HOSPITAL_LOGIN = { h1: "apex", h2: "sunrise", h3: "horizon", h4: "northstar", h5: "meridyen", h6: "lykia", h7: "lotusriver", h8: "lumenbay", h9: "pacifica", h10: "crescentpalm", h11: "serikenanga" };
hospitals.forEach((h) => (h.contactEmail = `${HOSPITAL_LOGIN[h.id]}@demo.com`));

const WEEKDAYS = [1, 2, 3, 4, 5];
const doctors = [
  ["d1", "Dr. Arvind Rao", "male", "/images/doctors/arvind-rao.jpg", "MBBS, MS, MCh (Cardiothoracic Surgery)", "Cardiac Surgery", "h1", 22, ["English", "Hindi", "Arabic"], ["Coronary Artery Bypass (CABG)", "Heart Valve Replacement", "Minimally invasive cardiac surgery"], 70, "Cardiothoracic surgeon focused on adult bypass and valve surgery, including minimally invasive approaches."],
  ["d2", "Dr. Priya Menon", "female", "/images/doctors/priya-menon.jpg", "MBBS, MS, MCh (Surgical Gastroenterology)", "Transplant Surgery", "h2", 18, ["English", "Tamil", "Malayalam"], ["Living-Donor Liver Transplant", "Kidney Transplant", "Hepatobiliary surgery"], 90, "Transplant surgeon who leads the living-donor programme and its donor-assessment pathway."],
  ["d3", "Dr. Sanjay Kapoor", "male", "/images/doctors/sanjay-kapoor.jpg", "MBBS, MS (Orthopaedics), Fellowship in Arthroplasty", "Orthopedics", "h1", 16, ["English", "Hindi"], ["Total Knee Replacement", "Total Hip Replacement", "Revision arthroplasty"], 50, "Joint-replacement surgeon with a particular interest in getting patients walking early and safely."],
  ["d4", "Dr. Leila Haddad", "female", "/images/doctors/leila-haddad.jpg", "MBBS, MD (Obstetrics & Gynaecology), Fellowship in Reproductive Medicine", "Fertility (IVF)", "h3", 14, ["English", "Arabic", "French"], ["IVF (one cycle)", "ICSI", "Egg freezing"], 60, "Fertility specialist who designs split-cycle plans so part of the monitoring can happen at home."],
  ["d5", "Dr. Ramesh Iyer", "male", "/images/doctors/ramesh-iyer.jpg", "MBBS, MS, MCh (Neurosurgery)", "Neurosurgery", "h2", 20, ["English", "Tamil", "Hindi"], ["Brain Tumour Surgery", "Spinal decompression", "Deep brain stimulation evaluation"], 80, "Neurosurgeon working with neuro-navigation and intraoperative imaging for tumour and spine surgery."],
  ["d6", "Dr. Neha Shah", "female", "/images/doctors/neha-shah.jpg", "MBBS, MS, MCh (Plastic Surgery)", "Cosmetic Surgery", "h3", 12, ["English", "Hindi", "Gujarati"], ["Rhinoplasty", "Liposuction", "Abdominoplasty"], 55, "Plastic surgeon focused on natural-looking facial and body contouring results."],
  ["d7", "Dr. Meera Krishnan", "female", "/images/doctors/meera-krishnan.jpg", "MBBS, MD, DM (Medical Oncology)", "Oncology", "h1", 15, ["English", "Hindi", "Kannada"], ["Cancer Treatment Planning", "Immunotherapy", "Tumour board review"], 75, "Medical oncologist who chairs the hospital's weekly tumour board for international referrals."],
  ["d8", "Dr. Kunal Desai", "male", "/images/doctors/kunal-desai.jpg", "MBBS, MS, FMAS (Minimal Access Surgery)", "Bariatric Surgery", "h3", 13, ["English", "Hindi", "Marathi"], ["Gastric Sleeve (Sleeve Gastrectomy)", "Gastric Bypass"], 50, "Bariatric surgeon who pairs every operation with a structured dietitian programme."],
  ["d9", "Dr. Vikram Sethi", "male", "/images/doctors/vikram-sethi.jpg", "MBBS, MS, MCh (CTVS)", "Cardiac Surgery", "h4", 24, ["English", "Hindi", "Punjabi"], ["Coronary Artery Bypass (CABG)", "Off-pump bypass", "Heart Valve Replacement"], 80, "Cardiac surgeon with a large off-pump bypass practice."],
  ["d10", "Dr. Ananya Bose", "female", "/images/doctors/ananya-bose.jpg", "MBBS, MS (Orthopaedics), Fellowship in Joint Replacement", "Orthopedics", "h4", 11, ["English", "Hindi", "Bengali"], ["Total Knee Replacement", "ACL Reconstruction"], 45, "Orthopaedic surgeon specialising in knee replacement and sports injuries."],
  ["d11", "Dr. Emre Yıldız", "male", "/images/doctors/emre-yildiz.jpg", "MD (Dermatology), Hair Restoration Fellowship", "Hair Restoration", "h5", 12, ["Turkish", "English", "Arabic"], ["Hair Transplant (FUE, ~3,000 grafts)", "DHI", "Beard transplant"], 40, "Dermatologist who personally designs each hairline and supervises graft placement."],
  ["d12", "Dr. Selin Aydın", "female", "/images/doctors/selin-aydin.jpg", "DDS, PhD (Prosthodontics)", "Dental", "h5", 10, ["Turkish", "English", "German"], ["Dental Implant (single, with crown)", "All-on-4 Full-Arch Implants (per arch)", "Veneers"], 35, "Prosthodontist focused on full-arch rehabilitation and implant planning."],
  ["d13", "Dr. Murat Kaya", "male", "/images/doctors/murat-kaya.jpg", "MD (Orthopaedics & Traumatology)", "Orthopedics", "h6", 17, ["Turkish", "English", "German"], ["Total Hip Replacement", "Total Knee Replacement", "Arthroscopy"], 50, "Orthopaedic surgeon with a coastal recovery programme for joint patients."],
  ["d14", "Dr. Deniz Arslan", "female", "/images/doctors/deniz-arslan.jpg", "MD (Ophthalmology)", "Ophthalmology", "h6", 13, ["Turkish", "English", "Russian"], ["Cataract Surgery (per eye)", "LASIK", "Refractive lens exchange"], 40, "Eye surgeon offering same-week cataract scheduling."],
  ["d15", "Dr. Somchai Rattanakorn", "male", "/images/doctors/somchai-rattanakorn.jpg", "MD, Board-certified Cardiothoracic Surgeon", "Cardiac Surgery", "h7", 21, ["Thai", "English"], ["Coronary Artery Bypass (CABG)", "Heart Valve Replacement"], 90, "Cardiothoracic surgeon leading the hospital's international cardiac programme."],
  ["d16", "Dr. Nattaya Srisuk", "female", "/images/doctors/nattaya-srisuk.jpg", "MD, Board-certified Plastic Surgeon", "Cosmetic Surgery", "h7", 14, ["Thai", "English", "Japanese"], ["Rhinoplasty", "Facelift", "Blepharoplasty"], 70, "Plastic surgeon known for conservative facial surgery."],
  ["d17", "Dr. Rachel Tan", "female", "/images/doctors/rachel-tan.jpg", "MBBS, MRCP, FAMS (Medical Oncology)", "Oncology", "h8", 16, ["English", "Mandarin"], ["Cancer Treatment Planning", "Targeted therapy", "Second opinions"], 120, "Medical oncologist who reviews international referrals at the weekly tumour board."],
  ["d18", "Dr. Daniel Lim", "male", "/images/doctors/daniel-lim.jpg", "MBBS, FRCS (Neurosurgery)", "Neurosurgery", "h8", 19, ["English", "Mandarin", "Malay"], ["Brain Tumour Surgery", "Endoscopic spine surgery"], 120, "Neurosurgeon specialising in image-guided tumour surgery."],
  ["d19", "Dr. Alejandro Ruiz", "male", "/images/doctors/alejandro-ruiz.jpg", "MD, Board-certified General & Bariatric Surgeon", "Bariatric Surgery", "h9", 15, ["Spanish", "English"], ["Gastric Sleeve (Sleeve Gastrectomy)", "Gastric Bypass", "Revision bariatric surgery"], 45, "Bariatric surgeon running a cross-border programme for US and Canadian patients."],
  ["d20", "Dr. Sofía Morales", "female", "/images/doctors/sofia-morales.jpg", "DDS (Implantology)", "Dental", "h9", 11, ["Spanish", "English"], ["Dental Implant (single, with crown)", "All-on-4 Full-Arch Implants (per arch)", "Crowns"], 30, "Implant dentist focused on two-visit full-arch treatment."],
  ["d21", "Dr. Omar Al-Farsi", "male", "/images/doctors/omar-al-farsi.jpg", "MBBS, FRCS (Trauma & Orthopaedics)", "Orthopedics", "h10", 18, ["Arabic", "English"], ["Total Knee Replacement", "ACL Reconstruction", "Total Hip Replacement"], 110, "Orthopaedic surgeon covering joint replacement and sports injuries for GCC patients."],
  ["d22", "Dr. Hana Nasser", "female", "/images/doctors/hana-nasser.jpg", "MBBS, MRCOG, Subspecialty in Reproductive Medicine", "Fertility (IVF)", "h10", 13, ["Arabic", "English", "French"], ["IVF (one cycle)", "ICSI", "Fertility preservation"], 100, "Reproductive medicine specialist with an Arabic-speaking fertility team."],
  ["d23", "Dr. Aziz Rahman", "male", "/images/doctors/aziz-rahman.jpg", "MBBS, MS, FRCS (Cardiothoracic)", "Cardiac Surgery", "h11", 20, ["Malay", "English", "Arabic"], ["Coronary Artery Bypass (CABG)", "Heart Valve Replacement", "Coronary Angioplasty (PCI with stent)"], 70, "Cardiac surgeon leading the cardiac rehab programme for international patients."],
  ["d24", "Dr. Mei Ling Wong", "female", "/images/doctors/mei-ling-wong.jpg", "MBBS, MOG, Fellowship in Reproductive Medicine", "Fertility (IVF)", "h11", 12, ["English", "Mandarin", "Malay"], ["IVF (one cycle)", "ICSI", "Egg freezing"], 65, "Fertility specialist who starts monitoring remotely before patients travel."],
].map(([id, name, gender, image, title, specialty, hospitalId, experienceYears, languages, procedures, consultFeeUSD, bio], i) => ({
  id, slug: slugify(name.replace(/^Dr\.\s*/, "dr ")), name, gender, image, title, specialty, hospitalId, experienceYears, languages, procedures, consultFeeUSD, bio,
  availability: { days: i % 3 === 0 ? [1, 2, 4, 5] : i % 3 === 1 ? WEEKDAYS : [1, 3, 5], slots: i % 2 === 0 ? ["09:00", "10:30", "14:00", "16:30"] : ["10:00", "11:30", "15:00", "17:00"] },
  sample: true,
}));

const packages = [
  ["p1", "h1", "total-knee-replacement", "Knee Replacement Recovery Package", 6200, 5, 10, ["Surgeon, anaesthesia and standard implant", "5 nights in hospital", "10 nights in a partner hotel near the hospital", "Airport pickup and drop", "Interpreter on request", "6 physiotherapy sessions", "2 follow-up video consults after you fly home"], ["Flights", "Premium implants", "Post-discharge medication"]],
  ["p2", "h4", "coronary-bypass-cabg", "Heart Bypass Package", 7900, 8, 10, ["Surgeon, anaesthesia and perfusion fees", "8 nights in hospital incl. 2 in ICU", "10 nights in a partner hotel", "Pre-op tests within 48 hours of arrival", "Airport transfers and interpreter", "Cardiac rehab session before departure"], ["Flights", "Extended ICU stay for complications"]],
  ["p3", "h9", "gastric-sleeve", "Gastric Sleeve All-Inclusive", 5400, 2, 3, ["Surgeon and anaesthesia fees", "2 nights in hospital", "3 nights recovery hotel", "San Diego airport shuttle", "6-month video dietitian programme"], ["Flights", "Supplements"]],
  ["p4", "h5", "hair-transplant", "FUE 3,000 Grafts Package", 2600, 0, 3, ["Procedure with surgeon-designed hairline", "3 hotel nights", "Airport and clinic transfers", "Medication and wash kit", "One PRP session", "12-month online follow-up"], ["Flights", "Extra grafts beyond 3,000"]],
  ["p5", "h5", "all-on-4-implants", "All-on-4 Single Arch", 5900, 0, 12, ["Four implants and temporary bridge (visit 1)", "Permanent bridge (visit 2)", "6 hotel nights per visit", "Transfers on both visits", "CBCT scans"], ["Flights", "Extractions beyond the plan"]],
  ["p6", "h11", "ivf", "IVF Cycle with ICSI", 5200, 0, 14, ["Consultations and monitoring scans", "Egg collection and ICSI", "Embryo transfer", "Remote monitoring before travel"], ["Stimulation medication", "Genetic testing (PGT)"]],
  ["p7", "h3", "cataract-surgery", "Both Eyes Cataract Package", 2400, 0, 4, ["Surgery on both eyes with standard monofocal lenses", "4 hotel nights", "Airport transfers", "Post-op checks"], ["Premium lenses", "Glasses"]],
  ["p8", "h7", "rhinoplasty", "Rhinoplasty Comfort Package", 4900, 1, 7, ["Surgeon and anaesthesia fees", "1 night in hospital", "7 hotel nights", "Transfers and interpreter", "Splint removal visit"], ["Flights", "Revision surgery"]],
].map(([id, hospitalId, treatmentSlug, title, priceUSD, hospitalNights, hotelNights, includes, excludes]) => ({ id, hospitalId, treatmentSlug, title, priceUSD, hospitalNights, hotelNights, includes, excludes, sample: true, active: true }));

const reviews = [
  ["r1", "h1", "F. Al-Mansoori", "UAE", 5, "Coronary bypass", "Coordination from the first consult to discharge felt like one case, not scattered across agents. The itemized quote matched the final bill.", "2026-08-12"],
  ["r2", "h1", "G. Oduya", "Kenya", 4, "Knee replacement", "The physio team was excellent. Airport pickup ran late on arrival, but the coordinator sorted it out quickly.", "2026-07-30"],
  ["r3", "h2", "M. Rahman", "Bangladesh", 5, "Kidney transplant", "The transplant coordinator explained every document the committee needed. A long stay, but we never felt lost.", "2026-06-18"],
  ["r4", "h3", "S. Chowdhury", "Bangladesh", 5, "IVF", "Clear about what medication was and wasn't included — no surprises at the end.", "2026-08-03"],
  ["r5", "h3", "A. Benali", "Morocco", 4, "Cataract surgery", "Quick and well organised. I would have liked my discharge notes in French as well as English.", "2026-07-11"],
  ["r6", "h4", "D. Petrov", "Uzbekistan", 5, "Heart bypass", "Pre-op tests were done within two days of landing, with a Russian-speaking interpreter throughout.", "2026-09-02"],
  ["r7", "h5", "J. Murphy", "United Kingdom", 5, "Hair transplant", "The surgeon designed the hairline personally and the hotel transfers were seamless.", "2026-08-21"],
  ["r8", "h5", "K. Alotaibi", "Saudi Arabia", 4, "Dental implants", "Good result. It's a busy clinic, so book the second visit well in advance.", "2026-06-29"],
  ["r9", "h7", "E. Johnson", "Australia", 5, "Rhinoplasty", "A calm, hotel-like hospital. Swelling went down exactly as they said it would.", "2026-07-19"],
  ["r10", "h8", "P. Santoso", "Indonesia", 5, "Cancer treatment planning", "The tumour board gave us a clear plan with costs for each stage before we travelled.", "2026-08-27"],
  ["r11", "h9", "R. Alvarez", "United States", 5, "Gastric sleeve", "The shuttle from San Diego made it easy, and the dietitian check-ins continued after I got home.", "2026-09-09"],
  ["r12", "h9", "L. Chen", "Canada", 4, "Dental implants", "Saved a lot compared with quotes at home. Two trips were needed, which they explained upfront.", "2026-05-22"],
  ["r13", "h10", "H. Al-Balushi", "Oman", 5, "ACL reconstruction", "Close to home with everything in Arabic. Pricier than India, but worth it for our family.", "2026-08-08"],
  ["r14", "h11", "N. Putri", "Indonesia", 5, "IVF", "A kind team and clear pricing. Monitoring started at home before we flew.", "2026-09-14"],
].map(([id, hospitalId, author, country, rating, procedure, text, date]) => ({ id, hospitalId, author, country, rating, procedure, text, date, sample: true, verified: false, status: "published" }));

const users = [
  { id: "u_admin", role: "admin", name: "Whole Care Admin", email: "admin@wholecare.com", password: "admin123" },
  { id: "u_coord", role: "coordinator", name: "Nadia Rahman", email: "care@wholecare.com", password: "care123", phone: "+971 4 000 0000" },
  { id: "u_demo_patient", role: "patient", name: "Aisha Karim", email: "demo.patient@wholecare.com", password: "demo123", country: "UAE", phone: "+971 50 000 0000" },
  { id: "u_p_okafor", role: "patient", name: "Daniel Okafor", email: "daniel.okafor@example.com", password: "demo123", country: "Nigeria" },
  { id: "u_p_hughes", role: "patient", name: "Margaret Hughes", email: "margaret.hughes@example.com", password: "demo123", country: "United Kingdom" },
  { id: "u_p_uddin", role: "patient", name: "Nasreen Uddin", email: "nasreen.uddin@example.com", password: "demo123", country: "Bangladesh" },
  ...hospitals.map((h) => ({ id: `u_${h.id}`, role: "hospital", hospitalId: h.id, name: h.name, email: h.contactEmail, password: "demo123" })),
].map(({ password, ...u }) => ({ ...u, passwordHash: hash(password), createdAt: "2026-09-01T00:00:00.000Z" }));

const ev = (label, at, kind = "system") => ({ label, at, kind });
const msg = (id, senderId, senderRole, senderLabel, text, at) => ({ id, senderId, senderRole, senderLabel, text, at });

const cases = [
  {
    id: "case_demo1", ownerId: "u_demo_patient", type: "treatment",
    patientName: "Aisha Karim", patientAge: 52, countryOfResidence: "UAE", treatmentSlug: "coronary-bypass-cabg", specialty: "Cardiac Surgery", preferredDestination: "India",
    condition: "Diagnosed with coronary artery disease; my cardiologist recommended bypass surgery after an angiogram.",
    existingTreatment: "On beta blockers and aspirin. Angiogram report and discharge summary attached.",
    budgetRange: "$6,000–10,000", timeline: "Within 6 weeks",
    stage: "Quotation Received", sentToHospitals: ["h1", "h4"], coordinatorId: "u_coord",
    hospitalStatus: { h1: { status: "quoted" }, h4: { status: "quoted" } },
    consentGivenAt: "2026-10-06T08:40:00.000Z", createdAt: "2026-10-06T08:40:00.000Z",
    timeline_events: [
      ev("Case submitted", "2026-10-06T08:40:00.000Z", "patient"),
      ev("Coordinator Nadia Rahman assigned", "2026-10-06T10:05:00.000Z", "coordinator"),
      ev("Case sent to 2 hospitals", "2026-10-07T09:00:00.000Z", "patient"),
      ev("Quotation received from Apex Global Hospital", "2026-10-09T13:20:00.000Z", "hospital"),
      ev("Quotation received from Northstar Heart & Joint Institute", "2026-10-10T11:45:00.000Z", "hospital"),
      ev("Video consultation with Dr. Arvind Rao confirmed", "2026-10-11T07:30:00.000Z", "system"),
    ],
    messages: [
      msg("msg_d1", "u_h1", "hospital", "Apex Global Hospital", "Hello Aisha — Dr. Rao has reviewed your angiogram. He'd also like a recent echocardiogram if you have one, so he can confirm the plan during your video consult.", "2026-10-08T10:12:00.000Z"),
      msg("msg_d2", "u_demo_patient", "patient", "Aisha Karim", "Thank you. I had an echo in September — uploading it this week.", "2026-10-08T15:40:00.000Z"),
      msg("msg_d3", "u_coord", "coordinator", "Nadia Rahman (Whole Care)", "Both quotes are in. Northstar includes 3 hotel nights; Apex doesn't but is $450 lower. Happy to walk through them on a call.", "2026-10-10T12:30:00.000Z"),
    ],
    travel: { arrivalDate: "", flightNumber: "", departureDate: "", companions: 1, accommodation: "", airportPickup: true, interpreterLanguage: "Arabic", notes: "" },
    visaLetter: { status: "none" }, recovery: { plan: [], checkins: [] }, share: { enabled: false, token: null },
  },
  {
    id: "case_demo2", ownerId: "u_demo_patient", type: "second_opinion",
    patientName: "Yusuf Karim", patientAge: 61, countryOfResidence: "UAE", treatmentSlug: "total-knee-replacement", specialty: "Orthopedics", preferredDestination: "India",
    condition: "Knee osteoarthritis (right knee). Local surgeon advised total knee replacement.",
    existingTreatment: "Physiotherapy for 6 months and two steroid injections, with limited relief. MRI report attached.",
    questions: "Is a knee replacement needed now, or could other treatment delay it? If surgery is needed, which implant would you suggest for a 61-year-old who walks a lot?",
    budgetRange: "", timeline: "Exploring options",
    stage: "Under Review", sentToHospitals: ["h1"], coordinatorId: "u_coord",
    hospitalStatus: { h1: { status: "reviewing" } },
    secondOpinion: { doctorId: "d3", hospitalId: "h1", status: "in_review", requestedAt: "2026-10-14T09:10:00.000Z", dueBy: "2026-10-21" },
    consentGivenAt: "2026-10-14T09:10:00.000Z", createdAt: "2026-10-14T09:10:00.000Z",
    timeline_events: [
      ev("Second-opinion request submitted", "2026-10-14T09:10:00.000Z", "patient"),
      ev("Assigned to Dr. Sanjay Kapoor (Orthopedics)", "2026-10-14T13:00:00.000Z", "coordinator"),
    ],
    messages: [],
    travel: { arrivalDate: "", flightNumber: "", departureDate: "", companions: 0, accommodation: "", airportPickup: false, interpreterLanguage: "", notes: "" },
    visaLetter: { status: "none" }, recovery: { plan: [], checkins: [] }, share: { enabled: false, token: null },
  },
  {
    id: "case_demo3", ownerId: "u_demo_patient", type: "treatment",
    patientName: "Fatima Karim", patientAge: 58, countryOfResidence: "UAE", treatmentSlug: "total-knee-replacement", specialty: "Orthopedics", preferredDestination: "India",
    condition: "Severe arthritis in the right knee; walking limited to short distances.",
    existingTreatment: "Painkillers and physiotherapy for two years.",
    budgetRange: "$5,000–8,000", timeline: "August 2026",
    stage: "Completed", sentToHospitals: ["h1"], coordinatorId: "u_coord", acceptedQuoteId: "quo_demo3",
    hospitalStatus: { h1: { status: "discharged" } },
    consentGivenAt: "2026-07-28T07:00:00.000Z", createdAt: "2026-07-28T07:00:00.000Z",
    timeline_events: [
      ev("Case submitted", "2026-07-28T07:00:00.000Z", "patient"),
      ev("Quotation received from Apex Global Hospital", "2026-07-30T12:00:00.000Z", "hospital"),
      ev("Quote accepted — price locked at $6,450", "2026-08-01T09:30:00.000Z", "patient"),
      ev("Visa invitation letter issued", "2026-08-02T11:00:00.000Z", "hospital"),
      ev("Arrived in Bangalore — airport pickup completed", "2026-08-18T22:10:00.000Z", "coordinator"),
      ev("Admitted for surgery", "2026-08-20T06:30:00.000Z", "hospital"),
      ev("Surgery completed successfully", "2026-08-20T13:45:00.000Z", "hospital"),
      ev("Discharged to partner hotel", "2026-08-25T11:00:00.000Z", "hospital"),
      ev("Flew home — recovery plan active", "2026-09-01T18:00:00.000Z", "coordinator"),
      ev("Case completed after 6-week follow-up", "2026-10-02T12:00:00.000Z", "coordinator"),
    ],
    messages: [
      msg("msg_f1", "u_h1", "hospital", "Apex Global Hospital", "Mrs. Karim is out of surgery and recovering well. Dr. Kapoor will see her on the ward this evening.", "2026-08-20T14:05:00.000Z"),
      msg("msg_f2", "u_demo_patient", "patient", "Aisha Karim", "Thank you so much for the update — the family tracker has been a relief for everyone at home.", "2026-08-20T14:30:00.000Z"),
    ],
    travel: { arrivalDate: "2026-08-18", flightNumber: "EK 568", departureDate: "2026-09-01", companions: 1, accommodation: "Partner hotel 1.2 km from hospital", airportPickup: true, interpreterLanguage: "Arabic", notes: "Wheelchair assistance booked for the return flight." },
    visaLetter: { status: "issued", requestedAt: "2026-08-01T10:00:00.000Z", issuedAt: "2026-08-02T11:00:00.000Z", issuedBy: "h1", refNo: "AGH/IPD/2026/0814" },
    recovery: {
      plan: [
        { id: "rt1", title: "Wound check with surgeon (video)", due: "2026-08-31", done: true },
        { id: "rt2", title: "Staple removal at a local clinic", due: "2026-09-04", done: true },
        { id: "rt3", title: "Physiotherapy, 3 sessions a week for 4 weeks", due: "2026-09-30", done: true },
        { id: "rt4", title: "6-week follow-up video consult", due: "2026-10-02", done: true },
        { id: "rt5", title: "3-month review with X-ray (send to Dr. Kapoor)", due: "2026-11-20", done: false },
      ],
      checkins: [
        { date: "2026-08-27", pain: 7, mobility: 2, note: "First day at the hotel, walking with a frame." },
        { date: "2026-08-30", pain: 6, mobility: 3, note: "" },
        { date: "2026-09-03", pain: 5, mobility: 4, note: "Flew home on the 1st — managed the flight well." },
        { date: "2026-09-08", pain: 4, mobility: 5, note: "" },
        { date: "2026-09-15", pain: 3, mobility: 6, note: "Physio going well." },
        { date: "2026-09-22", pain: 3, mobility: 7, note: "" },
        { date: "2026-09-29", pain: 2, mobility: 8, note: "" },
        { date: "2026-10-06", pain: 2, mobility: 8, note: "Walking without a stick indoors." },
      ],
    },
    share: { enabled: true, token: "fam-demo-2v8k4q", createdAt: "2026-08-02T12:00:00.000Z" },
  },
  {
    id: "case_okafor", ownerId: "u_p_okafor", type: "treatment",
    patientName: "Daniel Okafor", patientAge: 47, countryOfResidence: "Nigeria", treatmentSlug: "spinal-fusion", specialty: "Spine Surgery", preferredDestination: "India or Thailand",
    condition: "Lower back pain with leg numbness; MRI shows L4–L5 spondylolisthesis. Surgeon in Lagos recommended fusion.",
    existingTreatment: "Physiotherapy and pain medication for a year.",
    budgetRange: "$8,000–15,000", timeline: "Within 2 months",
    stage: "Sent to Hospitals", sentToHospitals: ["h4", "h7"], coordinatorId: null,
    hospitalStatus: { h4: { status: "new" }, h7: { status: "new" } },
    consentGivenAt: "2026-10-16T16:00:00.000Z", createdAt: "2026-10-16T16:00:00.000Z",
    timeline_events: [ev("Case submitted", "2026-10-16T16:00:00.000Z", "patient"), ev("Case sent to 2 hospitals", "2026-10-16T16:20:00.000Z", "patient")],
    messages: [],
    travel: { arrivalDate: "", flightNumber: "", departureDate: "", companions: 1, accommodation: "", airportPickup: true, interpreterLanguage: "", notes: "" },
    visaLetter: { status: "none" }, recovery: { plan: [], checkins: [] }, share: { enabled: false, token: null },
  },
  {
    id: "case_hughes", ownerId: "u_p_hughes", type: "treatment",
    patientName: "Margaret Hughes", patientAge: 66, countryOfResidence: "United Kingdom", treatmentSlug: "total-hip-replacement", specialty: "Orthopedics", preferredDestination: "Any",
    condition: "Hip osteoarthritis (left). NHS waiting list estimate is 14 months.",
    existingTreatment: "Painkillers; X-ray report attached.",
    budgetRange: "£10,000–16,000", timeline: "Within 3 months",
    stage: "Quotation Received", sentToHospitals: ["h1", "h10"], coordinatorId: "u_coord",
    hospitalStatus: { h1: { status: "reviewing" }, h10: { status: "quoted" } },
    consentGivenAt: "2026-10-09T10:00:00.000Z", createdAt: "2026-10-09T10:00:00.000Z",
    timeline_events: [ev("Case submitted", "2026-10-09T10:00:00.000Z", "patient"), ev("Case sent to 2 hospitals", "2026-10-09T10:30:00.000Z", "patient"), ev("Quotation received from Crescent Palm Hospital", "2026-10-13T08:15:00.000Z", "hospital")],
    messages: [msg("msg_h1", "u_h10", "hospital", "Crescent Palm Hospital", "Dear Margaret, Dr. Al-Farsi has prepared a quote. He'd be glad to discuss implant options on a video call.", "2026-10-13T08:20:00.000Z")],
    travel: { arrivalDate: "", flightNumber: "", departureDate: "", companions: 1, accommodation: "", airportPickup: true, interpreterLanguage: "", notes: "" },
    visaLetter: { status: "none" }, recovery: { plan: [], checkins: [] }, share: { enabled: false, token: null },
  },
  {
    id: "case_uddin", ownerId: "u_p_uddin", type: "treatment",
    patientName: "Nasreen Uddin", patientAge: 34, countryOfResidence: "Bangladesh", treatmentSlug: "ivf", specialty: "Fertility (IVF)", preferredDestination: "India",
    condition: "Unexplained infertility for 4 years; two unsuccessful IUI cycles.",
    existingTreatment: "Fertility work-up completed in Dhaka (report attached).",
    budgetRange: "$4,000–6,000", timeline: "November 2026",
    stage: "Confirmed", sentToHospitals: ["h3"], coordinatorId: "u_coord", acceptedQuoteId: "quo_uddin",
    hospitalStatus: { h3: { status: "accepted" } },
    consentGivenAt: "2026-09-29T05:00:00.000Z", createdAt: "2026-09-29T05:00:00.000Z",
    timeline_events: [
      ev("Case submitted", "2026-09-29T05:00:00.000Z", "patient"),
      ev("Quotation received from Horizon Speciality Centre", "2026-10-02T09:00:00.000Z", "hospital"),
      ev("Quote accepted — price locked at $4,350", "2026-10-06T06:00:00.000Z", "patient"),
      ev("Visa invitation letter issued", "2026-10-07T10:30:00.000Z", "hospital"),
    ],
    messages: [msg("msg_u1", "u_h3", "hospital", "Horizon Speciality Centre", "Your residency suite is reserved from 3 November. Dr. Haddad's team will start monitoring scans the morning after you arrive.", "2026-10-08T07:00:00.000Z")],
    travel: { arrivalDate: "2026-11-03", flightNumber: "BG 201", departureDate: "2026-11-20", companions: 1, accommodation: "Horizon residency suite (on campus)", airportPickup: true, interpreterLanguage: "Bengali", notes: "" },
    visaLetter: { status: "issued", requestedAt: "2026-10-06T06:30:00.000Z", issuedAt: "2026-10-07T10:30:00.000Z", issuedBy: "h3", refNo: "HSC/IPD/2026/1107" },
    recovery: { plan: [], checkins: [] }, share: { enabled: false, token: null },
  },
].map((c) => ({ ...c, updatedAt: c.timeline_events[c.timeline_events.length - 1].at }));

const q = (id, caseId, hospitalId, doctorId, doctorName, procedure, hospitalStayDays, lineItems, inclusions, exclusions, validityDays, createdAt, extra = {}) => ({
  id, caseId, hospitalId, doctorId, doctorName, procedure, hospitalStayDays, lineItems,
  totalUSD: lineItems.reduce((s, l) => s + l.amountUSD, 0), currency: "USD",
  inclusions, exclusions, validityDays, notes: "", status: "submitted", createdAt, ...extra,
});
const quotations = [
  q("quo_demo1", "case_demo1", "h1", "d1", "Dr. Arvind Rao", "Coronary Artery Bypass (CABG)", 8,
    [{ label: "Surgeon, anaesthesia & perfusion fees", amountUSD: 2600 }, { label: "Hospital stay — 8 nights incl. 2 in ICU", amountUSD: 2350 }, { label: "Operating theatre & consumables", amountUSD: 1250 }, { label: "Pre-operative tests", amountUSD: 450 }, { label: "Medicines during admission", amountUSD: 350 }],
    ["Airport pickup", "Arabic interpreter"], "Flights, hotel after discharge, post-discharge medication", 21, "2026-10-09T13:20:00.000Z"),
  q("quo_demo2", "case_demo1", "h4", "d9", "Dr. Vikram Sethi", "Off-pump Coronary Bypass (CABG)", 7,
    [{ label: "Surgeon & anaesthesia fees", amountUSD: 2900 }, { label: "Hospital stay — 7 nights incl. 2 in ICU", amountUSD: 2100 }, { label: "Operating theatre & consumables", amountUSD: 1300 }, { label: "Pre-operative tests (fast-track)", amountUSD: 400 }, { label: "Medicines during admission", amountUSD: 300 }, { label: "Partner hotel — 3 nights after discharge", amountUSD: 450 }],
    ["Airport pickup", "Arabic interpreter", "3 hotel nights"], "Flights, post-discharge medication", 30, "2026-10-10T11:45:00.000Z"),
  q("quo_demo3", "case_demo3", "h1", "d3", "Dr. Sanjay Kapoor", "Total Knee Replacement (right)", 5,
    [{ label: "Surgeon & anaesthesia fees", amountUSD: 2100 }, { label: "Standard knee implant", amountUSD: 1900 }, { label: "Hospital stay — 5 nights", amountUSD: 1500 }, { label: "Inpatient physiotherapy", amountUSD: 350 }, { label: "Pre-operative tests & medicines", amountUSD: 600 }],
    ["Airport pickup", "Arabic interpreter", "6 outpatient physio sessions"], "Flights, hotel, post-discharge medication", 21, "2026-07-30T12:00:00.000Z",
    { status: "accepted", acceptedAt: "2026-08-01T09:30:00.000Z", lockCode: "WC-LOCK-3F8K2", lockedUntil: "2026-09-30" }),
  q("quo_hughes", "case_hughes", "h10", "d21", "Dr. Omar Al-Farsi", "Total Hip Replacement (left)", 4,
    [{ label: "Surgeon & anaesthesia fees", amountUSD: 6800 }, { label: "Standard hip implant", amountUSD: 4200 }, { label: "Hospital stay — 4 nights (private room)", amountUSD: 4400 }, { label: "Physiotherapy (inpatient)", amountUSD: 900 }, { label: "Pre-operative tests & medicines", amountUSD: 2300 }],
    ["Airport pickup", "Family suite upgrade on request"], "Flights, hotel, post-discharge medication", 30, "2026-10-13T08:15:00.000Z"),
  q("quo_uddin", "case_uddin", "h3", "d4", "Dr. Leila Haddad", "IVF with ICSI (one cycle)", 0,
    [{ label: "Consultations & monitoring scans", amountUSD: 650 }, { label: "Egg collection (incl. sedation)", amountUSD: 1100 }, { label: "ICSI & embryology lab", amountUSD: 1400 }, { label: "Embryo transfer", amountUSD: 700 }, { label: "Residency suite — 14 nights", amountUSD: 500 }],
    ["Airport pickup", "Bengali interpreter", "Residency suite"], "Stimulation medication, embryo freezing, genetic testing", 30, "2026-10-02T09:00:00.000Z",
    { status: "accepted", acceptedAt: "2026-10-06T06:00:00.000Z", lockCode: "WC-LOCK-9QX4T", lockedUntil: "2026-11-30" }),
];

const consultations = [
  { id: "consult_demo1", ownerId: "u_demo_patient", caseId: "case_demo1", doctorId: "d1", hospitalId: "h1", doctorName: "Dr. Arvind Rao", hospitalName: "Apex Global Hospital", specialty: "Cardiac Surgery", date: "2026-10-23", timeSlot: "10:30", timezone: "IST (UTC+5:30)", timeZone: "Asia/Kolkata", reason: "Bypass vs. stents, timing, and recovery before flying home.", status: "confirmed", feeUSD: 70, roomId: room(), createdAt: "2026-10-10T16:00:00.000Z", confirmedAt: "2026-10-11T07:30:00.000Z" },
  { id: "consult_demo2", ownerId: "u_demo_patient", caseId: "case_demo3", doctorId: "d3", hospitalId: "h1", doctorName: "Dr. Sanjay Kapoor", hospitalName: "Apex Global Hospital", specialty: "Orthopedics", date: "2026-10-02", timeSlot: "16:00", timezone: "IST (UTC+5:30)", timeZone: "Asia/Kolkata", reason: "Six-week follow-up for Fatima.", status: "completed", feeUSD: 0, roomId: room(), createdAt: "2026-09-20T10:00:00.000Z", confirmedAt: "2026-09-20T12:00:00.000Z" },
  { id: "consult_hughes", ownerId: "u_p_hughes", caseId: "case_hughes", doctorId: "d21", hospitalId: "h10", doctorName: "Dr. Omar Al-Farsi", hospitalName: "Crescent Palm Hospital", specialty: "Orthopedics", date: "2026-10-27", timeSlot: "14:00", timezone: "GST (UTC+4)", timeZone: "Asia/Dubai", reason: "Implant options and recovery time.", status: "requested", feeUSD: 110, roomId: room(), createdAt: "2026-10-14T09:00:00.000Z" },
];

const files = [
  ["f_demo1", "case_demo1", "u_demo_patient", "angiogram_report.pdf", "report"],
  ["f_demo2", "case_demo1", "u_demo_patient", "discharge_summary.pdf", "report"],
  ["f_demo3", "case_demo2", "u_demo_patient", "knee_mri_report.pdf", "scan"],
  ["f_demo4", "case_demo3", "u_h1", "discharge_summary_apex.pdf", "discharge"],
  ["f_hughes1", "case_hughes", "u_p_hughes", "hip_xray_report.pdf", "scan"],
  ["f_okafor1", "case_okafor", "u_p_okafor", "mri_lumbar_spine_report.pdf", "scan"],
  ["f_uddin1", "case_uddin", "u_p_uddin", "fertility_workup.pdf", "report"],
].map(([id, caseId, uploadedBy, name, category]) => ({ id, caseId, uploadedBy, name, category, type: "application/pdf", storedAs: `${id}.pdf`, size: 0, demo: true, createdAt: cases.find((c) => c.id === caseId).createdAt }));

const notifications = [
  { id: "n1", userId: "u_demo_patient", message: "Northstar Heart & Joint Institute sent a quotation", link: "/case/case_demo1?tab=quotes", read: false, createdAt: "2026-10-10T11:45:00.000Z" },
  { id: "n2", userId: "u_demo_patient", message: "Video consult with Dr. Arvind Rao confirmed for Oct 23, 10:30 IST", link: "/dashboard", read: false, createdAt: "2026-10-11T07:30:00.000Z" },
  { id: "n3", userId: "u_demo_patient", message: "Apex Global Hospital sent a quotation", link: "/case/case_demo1?tab=quotes", read: true, createdAt: "2026-10-09T13:20:00.000Z" },
  { id: "n4", userId: "u_h1", message: "Second opinion requested: Yusuf Karim (Orthopedics)", link: "/hospital/h1/case/case_demo2", read: false, createdAt: "2026-10-14T13:00:00.000Z" },
  { id: "n5", userId: "u_h4", message: "New case: Daniel Okafor (Spine Surgery)", link: "/hospital/h4/case/case_okafor", read: false, createdAt: "2026-10-16T16:20:00.000Z" },
  { id: "n6", userId: "u_h7", message: "New case: Daniel Okafor (Spine Surgery)", link: "/hospital/h7/case/case_okafor", read: false, createdAt: "2026-10-16T16:20:00.000Z" },
  { id: "n7", userId: "u_coord", message: "Unassigned case: Daniel Okafor (Spine Surgery)", link: "/admin?tab=cases", read: false, createdAt: "2026-10-16T16:20:00.000Z" },
];

const inquiries = [
  { id: "inq1", name: "Grace Wanjiru", email: "grace.w@example.com", phone: "+254 700 000 000", message: "What does IVF cost in India compared with Malaysia?", source: "home", status: "new", createdAt: "2026-10-17T08:00:00.000Z" },
  { id: "inq2", name: "Tom Becker", email: "tom.becker@example.com", phone: "", message: "Hip replacement — NHS wait is 18 months. Which destinations make sense from the UK?", source: "contact", status: "contacted", createdAt: "2026-10-12T19:30:00.000Z" },
  { id: "inq3", name: "Layla Saleh", email: "layla.saleh@example.com", phone: "", message: "Rhinoplasty in Turkey or Thailand — how do recovery times compare?", source: "assistant", status: "new", createdAt: "2026-10-18T11:10:00.000Z" },
];

const auditLog = [
  { id: "a1", userId: "u_demo_patient", action: "case.created", targetId: "case_demo1", at: "2026-10-06T08:40:00.000Z" },
  { id: "a2", userId: "u_demo_patient", action: "case.sent_to_hospitals", targetId: "case_demo1", at: "2026-10-07T09:00:00.000Z" },
  { id: "a3", userId: "u_h1", action: "case.viewed", targetId: "case_demo1", at: "2026-10-08T09:55:00.000Z" },
  { id: "a4", userId: "u_h1", action: "quotation.created", targetId: "quo_demo1", at: "2026-10-09T13:20:00.000Z" },
  { id: "a5", userId: "u_h4", action: "quotation.created", targetId: "quo_demo2", at: "2026-10-10T11:45:00.000Z" },
  { id: "a6", userId: "u_admin", action: "hospital.approved", targetId: "h10", at: "2026-10-05T09:00:00.000Z" },
];

const seed = {
  meta: { schemaVersion: SCHEMA_VERSION, generatedAt: new Date().toISOString() },
  users, sessions: [], hospitals, doctors, packages, reviews, cases, quotations, consultations, files,
  notifications, inquiries, auditLog, assistantLog: [],
};

fs.writeFileSync(path.join(ROOT, "data", "seed.json"), JSON.stringify(seed, null, 2));

// Minimal valid single-page PDFs so demo documents can actually be opened.
function pdf(lines) {
  const esc = (s) => s.replace(/[\\()]/g, (m) => "\\" + m);
  const content = ["BT", "/F1 20 Tf", "72 740 Td", `(${esc(lines[0])}) Tj`, "/F1 12 Tf", ...lines.slice(1).flatMap((l) => ["0 -22 Td", `(${esc(l)}) Tj`]), "ET"].join("\n");
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}
const uploadDir = path.join(ROOT, "data", "seed-uploads");
fs.mkdirSync(uploadDir, { recursive: true });
for (const f of files) {
  const c = cases.find((x) => x.id === f.caseId);
  const body = pdf([
    "Whole Care - sample document",
    `File: ${f.name}`,
    `Case: ${c.patientName} (${c.id})`,
    "This placeholder stands in for a real medical report in the demo.",
    "It contains no real patient information.",
  ]);
  fs.writeFileSync(path.join(uploadDir, f.storedAs), body);
  f.size = Buffer.byteLength(body);
}
fs.writeFileSync(path.join(ROOT, "data", "seed.json"), JSON.stringify(seed, null, 2));
console.log(`seed.json written: ${hospitals.length} hospitals, ${doctors.length} doctors, ${packages.length} packages, ${reviews.length} reviews, ${cases.length} cases, ${users.length} users`);
