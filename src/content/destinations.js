// Destination guides. Visa and travel details are general orientation only —
// every guide tells patients to confirm current rules on official portals.
export const DESTINATIONS = [
  {
    slug: "india",
    country: "India",
    code: "IN",
    hub: { city: "New Delhi", lat: 28.6139, lng: 77.209 },
    cities: [
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
    ],
    accent: ["#F59E0B", "#0E8F82"],
    tagline: "Deep surgical experience at a fraction of Western prices, with English-speaking care teams.",
    summary:
      "India treats more international patients than almost any other destination, with very high surgical volumes in cardiac, orthopaedic, transplant and oncology care. Large private hospitals run dedicated international patient departments that handle visas, interpreters and airport pickups.",
    whyChoose: [
      "Among the lowest prices for complex surgery (cardiac, transplant, joint replacement)",
      "English is the working language in most private hospitals",
      "High surgical volumes at large tertiary hospitals",
      "Established e-Medical visa with attendant visas for companions",
      "Short flights from the Gulf, East Africa and South Asia",
    ],
    considerations: [
      "Long-haul from the Americas (14+ hours to Delhi)",
      "Summer (April–June) is very hot in the north — plan recovery stays accordingly",
      "City traffic can be heavy; stay close to your hospital",
    ],
    strengths: ["Cardiac Surgery", "Orthopedics", "Transplant Surgery", "Oncology", "Fertility (IVF)"],
    accreditation: ["NABH (national)", "JCI (international)"],
    visa: {
      type: "e-Medical Visa (plus e-Medical Attendant Visa for companions)",
      duration: "Typically up to 60 days from arrival, triple entry; can be extended in-country for ongoing treatment",
      notes: "Needs a letter from the treating hospital. Whole Care's hospital partners issue this once they accept your case.",
    },
    currency: { code: "INR", name: "Indian Rupee" },
    languages: "English and Hindi widely used in hospitals; interpreters for Arabic, Russian, French and more",
    timezone: "IST (UTC+5:30)",
    timeZone: "Asia/Kolkata",
    bestTime: "October to March — cooler and comfortable for recovery",
    flightTimes: [
      { from: "Dubai", hours: "≈3h" },
      { from: "Nairobi", hours: "≈6h" },
      { from: "London", hours: "≈9h" },
      { from: "New York", hours: "≈14h" },
    ],
    costIndex: 1,
  },
  {
    slug: "turkey",
    country: "Turkey",
    code: "TR",
    hub: { city: "Istanbul", lat: 41.0082, lng: 28.9784 },
    cities: [
      { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
      { name: "Antalya", lat: 36.8969, lng: 30.7133 },
    ],
    accent: ["#E8713C", "#0E8F82"],
    tagline: "Europe's elective-surgery hub — hair, dental, aesthetic and bariatric care within a short flight.",
    summary:
      "Turkey combines modern private hospitals with very competitive pricing for elective procedures. Istanbul and Antalya hospitals commonly bundle transfers and hotel stays into package prices.",
    whyChoose: [
      "Short flights from Europe, the Gulf and North Africa",
      "Highly competitive prices for hair transplant, dental and bariatric surgery",
      "All-inclusive packages with hotel and transfers are common",
      "Many hospitals hold JCI accreditation",
    ],
    considerations: [
      "Package quality varies widely — check the surgeon, not just the price",
      "Very busy clinics can feel high-volume; ask who performs each step",
      "Lira price swings mean quotes are often fixed in EUR or USD",
    ],
    strengths: ["Hair Restoration", "Dental", "Cosmetic Surgery", "Bariatric Surgery", "Ophthalmology"],
    accreditation: ["Ministry of Health licensing", "JCI (international)"],
    visa: {
      type: "e-Visa or visa-free entry for many nationalities",
      duration: "Short stays are usually covered by visa-free entry or an e-Visa; longer treatment may need a consular visa",
      notes: "Carry the hospital's treatment letter. Check the official e-Visa portal for your passport.",
    },
    currency: { code: "TRY", name: "Turkish Lira" },
    languages: "Turkish; international departments offer English, Arabic, German and Russian interpreters",
    timezone: "TRT (UTC+3)",
    timeZone: "Europe/Istanbul",
    bestTime: "April–June and September–November",
    flightTimes: [
      { from: "London", hours: "≈4h" },
      { from: "Dubai", hours: "≈4.5h" },
      { from: "Lagos", hours: "≈7h" },
      { from: "New York", hours: "≈10h" },
    ],
    costIndex: 1.3,
  },
  {
    slug: "thailand",
    country: "Thailand",
    code: "TH",
    hub: { city: "Bangkok", lat: 13.7563, lng: 100.5018 },
    cities: [{ name: "Bangkok", lat: 13.7563, lng: 100.5018 }],
    accent: ["#7C3AED", "#0E8F82"],
    tagline: "Hospitality-grade hospitals and multilingual care teams in Bangkok.",
    summary:
      "Bangkok's international hospitals are known for service, interpreters in many languages and embassy liaison desks. Prices sit between South Asia and Singapore.",
    whyChoose: [
      "Hotel-style service and large interpreter teams",
      "Strong cosmetic, orthopaedic and cardiac programmes",
      "Visa-exempt short stays for many nationalities",
      "Good recovery-stay options in and around Bangkok",
    ],
    considerations: [
      "More expensive than India or Turkey for most procedures",
      "Hot and humid; the rainy season runs roughly June–October",
    ],
    strengths: ["Cosmetic Surgery", "Cardiac Surgery", "Orthopedics", "Oncology"],
    accreditation: ["HA Thailand (national)", "JCI (international)"],
    visa: {
      type: "Visa exemption for short stays; Non-Immigrant 'MT' visa for longer medical treatment",
      duration: "Depends on nationality — longer treatment usually needs the medical-treatment visa",
      notes: "Hospitals provide appointment letters to support visa applications.",
    },
    currency: { code: "THB", name: "Thai Baht" },
    languages: "Thai; English, Arabic, Japanese and Chinese interpreters at international hospitals",
    timezone: "ICT (UTC+7)",
    timeZone: "Asia/Bangkok",
    bestTime: "November to February — cooler and drier",
    flightTimes: [
      { from: "Dubai", hours: "≈6h" },
      { from: "Sydney", hours: "≈9h" },
      { from: "London", hours: "≈11.5h" },
    ],
    costIndex: 2.1,
  },
  {
    slug: "singapore",
    country: "Singapore",
    code: "SG",
    hub: { city: "Singapore", lat: 1.3521, lng: 103.8198 },
    cities: [{ name: "Singapore", lat: 1.2903, lng: 103.8519 }],
    accent: ["#DC2626", "#0E8F82"],
    tagline: "Asia's premium referral hub for complex oncology, neurosurgery and transplant.",
    summary:
      "Singapore is the choice when complexity matters more than price: advanced oncology, neurosurgery and multidisciplinary tumour boards, in an English-speaking, tightly regulated system.",
    whyChoose: [
      "Strong regulation and English as the working language",
      "Advanced oncology and neurosurgery capability",
      "Excellent air connectivity across Asia-Pacific",
      "Very low travel friction for most passports",
    ],
    considerations: [
      "Among the most expensive destinations in Asia",
      "Accommodation near hospitals is costly — budget for it",
    ],
    strengths: ["Oncology", "Neurosurgery", "Transplant Surgery", "Cardiac Surgery"],
    accreditation: ["MOH licensing (national)", "JCI (international)"],
    visa: {
      type: "Visa-free for many nationalities; others apply online",
      duration: "Short visits commonly 30 days; longer treatment stays can be extended with hospital support",
      notes: "Hospitals can provide letters supporting visa applications or extensions.",
    },
    currency: { code: "SGD", name: "Singapore Dollar" },
    languages: "English (official), Mandarin, Malay, Tamil",
    timezone: "SGT (UTC+8)",
    timeZone: "Asia/Singapore",
    bestTime: "Year-round; November–January is wetter",
    flightTimes: [
      { from: "Dubai", hours: "≈7h" },
      { from: "Sydney", hours: "≈8h" },
      { from: "London", hours: "≈13h" },
    ],
    costIndex: 3.4,
  },
  {
    slug: "mexico",
    country: "Mexico",
    code: "MX",
    hub: { city: "Tijuana", lat: 32.5149, lng: -117.0382 },
    cities: [{ name: "Tijuana", lat: 32.5149, lng: -117.0382 }],
    accent: ["#16A34A", "#0E8F82"],
    tagline: "Cross-border care for North American patients — bariatric, dental and aesthetic procedures.",
    summary:
      "For US and Canadian patients, Mexico's border cities offer significant savings without a long-haul flight. Many hospitals run shuttles from San Diego airport.",
    whyChoose: [
      "Drive or short flight from the US and Canada",
      "Large bariatric and dental programmes",
      "Same time zones as much of North America",
      "Many staff speak English in medical-tourism hubs",
    ],
    considerations: [
      "Quality varies — accreditation and surgeon checks matter",
      "Check your home insurer's stance on treatment abroad",
    ],
    strengths: ["Bariatric Surgery", "Dental", "Cosmetic Surgery", "Orthopedics"],
    accreditation: ["CSG certification (national)", "JCI (international)"],
    visa: {
      type: "Visa-free for US, Canadian, UK and EU passports",
      duration: "Tourist entry is set by the immigration officer at arrival",
      notes: "Other nationalities may need a visa — confirm with the nearest Mexican consulate.",
    },
    currency: { code: "MXN", name: "Mexican Peso" },
    languages: "Spanish; English widely spoken in border medical hubs",
    timezone: "Pacific Time (Tijuana)",
    timeZone: "America/Tijuana",
    bestTime: "November to April",
    flightTimes: [
      { from: "Los Angeles", hours: "≈1h" },
      { from: "Houston", hours: "≈3h" },
      { from: "Toronto", hours: "≈5.5h" },
    ],
    costIndex: 1.6,
  },
  {
    slug: "uae",
    country: "UAE",
    code: "AE",
    hub: { city: "Dubai", lat: 25.2048, lng: 55.2708 },
    cities: [{ name: "Dubai", lat: 25.2048, lng: 55.2708 }],
    accent: ["#0EA5E9", "#0E8F82"],
    tagline: "Premium care closer to home for GCC families, with a growing specialist base.",
    summary:
      "The UAE suits patients who want international-standard hospitals without long-haul travel, especially from the GCC. Prices are higher than South Asia but convenience and familiarity are strong draws.",
    whyChoose: [
      "Short flights across the GCC, South Asia and East Africa",
      "Arabic and English throughout the care journey",
      "Modern hospitals with many internationally trained specialists",
    ],
    considerations: [
      "Higher prices than India, Turkey or Malaysia",
      "Summer heat (June–September) affects recovery outings",
    ],
    strengths: ["Orthopedics", "Fertility (IVF)", "Cardiac Surgery", "Ophthalmology"],
    accreditation: ["DHA / DoH licensing", "JCI (international)"],
    visa: {
      type: "Visa on arrival or visa-free for many nationalities; hospital-sponsored medical treatment visa for others",
      duration: "Depends on nationality and visa type",
      notes: "Hospitals can sponsor a medical treatment visa when needed.",
    },
    currency: { code: "AED", name: "UAE Dirham" },
    languages: "Arabic and English; Hindi, Urdu and Russian common",
    timezone: "GST (UTC+4)",
    timeZone: "Asia/Dubai",
    bestTime: "November to March",
    flightTimes: [
      { from: "Riyadh", hours: "≈2h" },
      { from: "Nairobi", hours: "≈5h" },
      { from: "London", hours: "≈7h" },
    ],
    costIndex: 2.9,
  },
  {
    slug: "malaysia",
    country: "Malaysia",
    code: "MY",
    hub: { city: "Kuala Lumpur", lat: 3.139, lng: 101.6869 },
    cities: [{ name: "Kuala Lumpur", lat: 3.139, lng: 101.6869 }],
    accent: ["#2563EB", "#0E8F82"],
    tagline: "Value and regulation balanced — strong fertility and cardiac care in Kuala Lumpur.",
    summary:
      "Malaysia regulates healthcare-traveller pricing and has a well-organised international patient sector. It is popular with Indonesian, Middle Eastern and Australian patients.",
    whyChoose: [
      "Government-regulated fee schedules for many procedures",
      "English widely spoken; Muslim-friendly hospitals",
      "Good value for fertility, cardiac and orthopaedic care",
    ],
    considerations: [
      "Fewer ultra-specialised programmes than Singapore",
      "Monsoon seasons differ by coast — check your dates",
    ],
    strengths: ["Fertility (IVF)", "Cardiac Surgery", "Orthopedics", "Oncology"],
    accreditation: ["MSQH (national)", "JCI (international)"],
    visa: {
      type: "Visa-free entry for many nationalities; others apply via eVISA",
      duration: "Commonly 30–90 days depending on nationality",
      notes: "Most travellers complete the Malaysia Digital Arrival Card before arrival.",
    },
    currency: { code: "MYR", name: "Malaysian Ringgit" },
    languages: "Malay and English; Mandarin and Arabic support common",
    timezone: "MYT (UTC+8)",
    timeZone: "Asia/Kuala_Lumpur",
    bestTime: "Year-round",
    flightTimes: [
      { from: "Jakarta", hours: "≈2h" },
      { from: "Dubai", hours: "≈7h" },
      { from: "Sydney", hours: "≈8h" },
    ],
    costIndex: 1.8,
  },
];

// Origin cities used for the care-corridor arcs on the globe.
export const ORIGINS = [
  { city: "London", lat: 51.5072, lng: -0.1276 },
  { city: "New York", lat: 40.7128, lng: -74.006 },
  { city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { city: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { city: "Lagos", lat: 6.5244, lng: 3.3792 },
  { city: "Nairobi", lat: -1.2921, lng: 36.8219 },
  { city: "Riyadh", lat: 24.7136, lng: 46.6753 },
  { city: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { city: "Sydney", lat: -33.8688, lng: 151.2093 },
  { city: "Muscat", lat: 23.588, lng: 58.3829 },
  { city: "Dubai", lat: 25.2048, lng: 55.2708 },
];

// Which origin flows to which destination hub on the globe.
export const CORRIDORS = [
  ["London", "india"], ["Dubai", "india"], ["Nairobi", "india"], ["Dhaka", "india"], ["Muscat", "india"], ["Lagos", "india"],
  ["London", "turkey"], ["Riyadh", "turkey"], ["Lagos", "turkey"],
  ["Sydney", "thailand"], ["Riyadh", "thailand"],
  ["Sydney", "singapore"], ["New York", "singapore"],
  ["Los Angeles", "mexico"], ["Toronto", "mexico"], ["New York", "mexico"],
  ["Riyadh", "uae"], ["Nairobi", "uae"],
  ["Sydney", "malaysia"], ["Dhaka", "malaysia"],
];

export function destinationBySlug(slug) {
  return DESTINATIONS.find((d) => d.slug === slug) || null;
}

export function destinationByCountry(country) {
  return DESTINATIONS.find((d) => d.country === country) || null;
}

// Indicative planning costs in USD (late 2026). Hotel tiers are per room per night near the main
// hospital districts: budget / comfort / premium. Meals are per person per day; local transport is
// per day for the group. Visa is a typical fee per traveller and varies by passport (many pay nothing).
export const STAY_COSTS = {
  India: { hotel: [25, 55, 120], meals: 15, transport: 8, visa: 80 },
  Turkey: { hotel: [35, 70, 150], meals: 25, transport: 10, visa: 50 },
  Thailand: { hotel: [30, 65, 160], meals: 20, transport: 10, visa: 40 },
  Singapore: { hotel: [90, 160, 320], meals: 35, transport: 12, visa: 20 },
  Mexico: { hotel: [40, 80, 170], meals: 25, transport: 12, visa: 25 },
  UAE: { hotel: [70, 130, 280], meals: 35, transport: 15, visa: 120 },
  Malaysia: { hotel: [30, 60, 140], meals: 18, transport: 8, visa: 25 },
};
