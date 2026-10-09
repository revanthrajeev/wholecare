"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/Nav";

// Indicative, static conversion rates from USD for display only — not live FX.
const CURRENCIES = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  AED: { symbol: "AED ", rate: 3.67 },
  INR: { symbol: "₹", rate: 83.1 },
};

const TRAVEL_LAYERS = [
  { key: "visa", label: "Visa", cost: 150 },
  { key: "flights", label: "Flights (round trip)", cost: 700 },
  { key: "hotel", label: "Hotel (per week)", cost: 350 },
  { key: "transfer", label: "Airport transfer + local transport", cost: 120 },
  { key: "companion", label: "Companion expenses", cost: 600 },
];

export default function Calculator() {
  const [treatments, setTreatments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [stayWeeks, setStayWeeks] = useState(1);
  const [companion, setCompanion] = useState(true);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    fetch("/api/treatments").then((r) => r.json()).then((t) => {
      setTreatments(t);
      setSelected(t[0]?.id || null);
    });
  }, []);

  const treatment = treatments.find((t) => t.id === selected);
  const medicalLow = treatment?.indiaCostLow || 0;
  const medicalHigh = treatment?.indiaCostHigh || 0;

  const travelCost =
    TRAVEL_LAYERS.find((l) => l.key === "visa").cost +
    TRAVEL_LAYERS.find((l) => l.key === "flights").cost +
    TRAVEL_LAYERS.find((l) => l.key === "hotel").cost * stayWeeks +
    TRAVEL_LAYERS.find((l) => l.key === "transfer").cost +
    (companion ? TRAVEL_LAYERS.find((l) => l.key === "companion").cost : 0);

  const totalLow = medicalLow + travelCost;
  const totalHigh = medicalHigh + travelCost;

  const { symbol, rate } = CURRENCIES[currency];
  const fmt = (usd) => `${symbol}${Math.round(usd * rate).toLocaleString()}`;

  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Cost Calculator</p>
        <h1 className="text-4xl font-extrabold mb-4">Estimate your full journey cost</h1>
        <p className="text-[#5B7184] mb-10 max-w-2xl">
          Medical + travel + companion costs, laid out transparently &mdash; not a single
          opaque number. Figures below are indicative package ranges, not hospital-confirmed quotes.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={card}>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Treatment</label>
            <select
              value={selected || ""}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] mb-6 focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
            >
              {treatments.map((t) => (
                <option key={t.id} value={t.id} className="bg-white">{t.name}</option>
              ))}
            </select>

            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Expected stay (weeks)</label>
            <input
              type="range"
              min="1"
              max="6"
              value={stayWeeks}
              onChange={(e) => setStayWeeks(Number(e.target.value))}
              className="w-full accent-[#2F6FED] mb-2"
            />
            <p className="text-sm text-[#344A61] mb-6">{stayWeeks} week{stayWeeks > 1 ? "s" : ""}</p>

            <label className="flex items-center gap-3 text-sm cursor-pointer mb-6">
              <input type="checkbox" checked={companion} onChange={(e) => setCompanion(e.target.checked)} className="accent-[#2F6FED]" />
              Include companion travel costs
            </label>

            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Display currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c} className="bg-white">{c}</option>
              ))}
            </select>
          </div>

          <div className={card}>
            <p className="text-sm font-semibold text-[#5B7184] mb-4">Journey cost breakdown</p>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[#5B7184]">Medical (India, {treatment?.specialty})</span>
                <span className="font-semibold">{fmt(medicalLow)}&ndash;{fmt(medicalHigh)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5B7184]">Travel + stay ({stayWeeks}w{companion ? ", with companion" : ""})</span>
                <span className="font-semibold">{fmt(travelCost)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E3EAF2] pt-3 text-base">
                <span className="font-bold">Total estimated journey</span>
                <span className="font-extrabold text-[#2F6FED] text-xl">{fmt(totalLow)}&ndash;{fmt(totalHigh)}</span>
              </div>
            </div>
            {treatment && (
              <p className="text-xs text-[#5B7184] mb-6">
                Typical hospital stay: {treatment.stayDays} days &middot; vs. {treatment.homeCountryMultiple} of this cost in the patient&rsquo;s home country.
              </p>
            )}
            <Link
              href="/case/new"
              className="block text-center btn-grad py-3 rounded-xl font-bold"
            >
              Start a Case for this treatment
            </Link>
          </div>
        </div>

        <p className="text-[#5B7184] text-xs mt-8 max-w-2xl">
          Medical cost ranges: ClinicBooking, &ldquo;Global Medical Tourism 2024&rdquo; report and KareTrip specialty pricing data. Travel-layer figures are planning estimates, not live fares. All numbers are indicative until a hospital submits a confirmed quotation for a specific case.
        </p>
      </div>
    </main>
  );
}
