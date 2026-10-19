import { DESTINATIONS, ORIGINS, STAY_COSTS } from "@/content/destinations";

export const HOTEL_TIERS = ["Budget", "Comfort", "Premium"];

function distanceKm(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// Economy return fare per traveller, estimated from great-circle distance to the destination hub.
// A planning heuristic, not a fare quote — the calculator lets people type their real fare.
export function estimateFlightUSD(originCity, country) {
  const o = ORIGINS.find((x) => x.city === originCity);
  const d = DESTINATIONS.find((x) => x.country === country);
  if (!o || !d) return null;
  return Math.round((90 + 0.105 * distanceKm(o, d.hub)) / 10) * 10;
}

// "14–21 days" → 18, "3–4 weeks" → 25, "2–3 months" → 75; falls back to 14.
export function suggestedNights(text = "") {
  const m = String(text).match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(day|week|month)/i);
  if (!m) return 14;
  const lo = Number(m[1]);
  const hi = Number(m[2] || m[1]);
  const unit = { day: 1, week: 7, month: 30 }[m[3].toLowerCase()];
  return Math.max(2, Math.round(((lo + hi) / 2) * unit));
}

const to10 = (x) => Math.round(x / 10) * 10;

// Full-trip estimate in USD. Treatment stays a range; travel and stay are point estimates,
// rounded to $10 so the result doesn't suggest more precision than an estimate has.
export function tripCost({ treatment, country, travellers = 2, nights = 14, tier = 1, flightUSD = 0, buffer = true }) {
  const range = treatment?.prices?.[country];
  const stay = STAY_COSTS[country];
  if (!range || !stay) return null;
  const rooms = Math.ceil(travellers / 2);
  const lines = {
    flights: to10(flightUSD * travellers),
    hotel: to10(stay.hotel[tier] * nights * rooms),
    living: to10((stay.meals * travellers + stay.transport) * nights),
    visa: to10(stay.visa * travellers),
  };
  const extras = lines.flights + lines.hotel + lines.living + lines.visa;
  const bufferRange = buffer ? [to10(range[0] * 0.1), to10(range[1] * 0.1)] : [0, 0];
  return {
    treatment: range,
    lines,
    rooms,
    stay,
    extras,
    buffer: bufferRange,
    total: [range[0] + extras + bufferRange[0], range[1] + extras + bufferRange[1]],
  };
}
