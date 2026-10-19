"use client";
import { useState } from "react";
import Link from "next/link";
import { Plane, Landmark, FileCheck2, Lock, ExternalLink, Hotel, Car, Languages, CheckCircle2, Clock } from "lucide-react";
import { Button, Field, Input, Select, Textarea, Badge, formatDate, buttonClass } from "@/components/ui/core";
import { DESTINATIONS } from "@/content/destinations";

const ACCOMMODATION = ["Hospital residency / on-campus", "Partner hotel near the hospital", "I'll arrange my own"];
const LANGS = ["", "Arabic", "Bengali", "French", "Russian", "Swahili", "Spanish", "Indonesian", "Uzbek", "Amharic", "Somali", "Other"];

export default function TravelTab({ data, act, busy, editable = true }) {
  const { case: c, quotations, hospitals } = data;
  const accepted = quotations.find((q) => q.id === c.acceptedQuoteId);
  const hospital = accepted ? hospitals[accepted.hospitalId] : null;
  const dest = DESTINATIONS.find((d) => d.country === hospital?.country);
  const [travel, setTravel] = useState(c.travel || {});
  const [savedTravel, setSavedTravel] = useState(c.travel);
  if (savedTravel !== c.travel) {
    setSavedTravel(c.travel);
    setTravel(c.travel || {});
  }
  const set = (k, v) => setTravel((t) => ({ ...t, [k]: v }));

  if (!accepted) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-50 text-ink-500">
          <Lock size={22} aria-hidden />
        </span>
        <p className="mt-4 font-display text-lg font-bold text-ink-900">Travel planning unlocks when you accept a quote</p>
        <p className="mt-1.5 max-w-md text-sm text-ink-500">The treating hospital issues your visa invitation letter, and we plan flights, stay and airport pickup around your admission date.</p>
        <Link href="?tab=quotes" className={buttonClass({ variant: "outline", className: "mt-5" })}>
          Review quotes
        </Link>
      </div>
    );
  }

  const v = c.visaLetter || { status: "none" };
  const flight = (travel.flightNumber || "").replace(/\s+/g, "").toUpperCase();
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-bold text-ink-900">
              <Landmark size={18} className="text-brand-600" aria-hidden /> Visa for {dest?.country || hospital?.country}
            </p>
            {dest && <p className="mt-1 text-sm text-ink-600">{dest.visa.type}</p>}
            {dest && <p className="text-xs text-ink-500">{dest.visa.duration}</p>}
          </div>
          <Badge tone={v.status === "issued" ? "success" : v.status === "requested" ? "sun" : "neutral"}>{v.status === "issued" ? "Letter issued" : v.status === "requested" ? "Letter requested" : "Letter not requested"}</Badge>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <ul className="space-y-2.5 text-sm text-ink-700">
            {[
              "Passport valid 6+ months beyond your stay",
              "Recent passport photos",
              "Hospital invitation letter",
              "Proof of funds or a sponsor letter",
              "Return or onward travel booking",
              ...(dest?.slug === "india" ? ["Attendant visa applications for companions"] : []),
            ].map((x) => (
              <li key={x} className="flex gap-2.5">
                <CheckCircle2 size={17} className={x.includes("invitation") && v.status === "issued" ? "shrink-0 text-ok-600" : "shrink-0 text-ink-300"} aria-hidden /> {x}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-ink-50 p-5">
            {v.status === "issued" ? (
              <>
                <p className="flex items-center gap-2 font-semibold text-ink-900">
                  <FileCheck2 size={18} className="text-ok-600" aria-hidden /> Invitation letter ready
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  Ref {v.refNo} · issued {formatDate(v.issuedAt)}
                </p>
                <Link href={`/case/${c.id}/visa-letter`} target="_blank" className={buttonClass({ size: "sm", className: "mt-4" })}>
                  Open printable letter <ExternalLink size={14} aria-hidden />
                </Link>
              </>
            ) : v.status === "requested" ? (
              <>
                <p className="flex items-center gap-2 font-semibold text-ink-900">
                  <Clock size={18} className="text-sun-700" aria-hidden /> Requested {formatDate(v.requestedAt)}
                </p>
                <p className="mt-1 text-sm text-ink-500">{hospital?.name} issues it after confirming your dates — you&rsquo;ll get a notification.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink-900">Need a visa invitation letter?</p>
                <p className="mt-1 text-sm text-ink-500">{hospital?.name} can issue one now that you&rsquo;ve accepted their quote.</p>
                {editable && (
                  <Button size="sm" className="mt-4" disabled={busy} onClick={() => act("requestVisaLetter", {}, "Visa letter requested")}>
                    Request invitation letter
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-400">Rules change — confirm requirements for your passport on the official government portal before booking flights.</p>
      </section>

      <section className="card p-6">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <Plane size={18} className="text-brand-600" aria-hidden /> Travel details
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Arrival date" htmlFor="t-arr">
            <Input id="t-arr" type="date" value={travel.arrivalDate || ""} onChange={(e) => set("arrivalDate", e.target.value)} disabled={!editable} />
          </Field>
          <Field label="Return date" htmlFor="t-dep">
            <Input id="t-dep" type="date" value={travel.departureDate || ""} onChange={(e) => set("departureDate", e.target.value)} disabled={!editable} />
          </Field>
          <Field label="Arriving flight" htmlFor="t-flight" optional>
            <Input id="t-flight" placeholder="e.g. EK 568" value={travel.flightNumber || ""} onChange={(e) => set("flightNumber", e.target.value)} disabled={!editable} />
          </Field>
        </div>
        {flight && (
          <a href={`https://www.flightaware.com/live/flight/${encodeURIComponent(flight)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            Live status for {flight} <ExternalLink size={13} aria-hidden />
          </a>
        )}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Companions" htmlFor="t-comp">
            <Select id="t-comp" value={String(travel.companions ?? 0)} onChange={(e) => set("companions", Number(e.target.value))} disabled={!editable}>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Travelling alone" : `${n} companion${n > 1 ? "s" : ""}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Stay" htmlFor="t-stay">
            <Select id="t-stay" value={ACCOMMODATION.includes(travel.accommodation) ? travel.accommodation : travel.accommodation ? "__custom" : ""} onChange={(e) => set("accommodation", e.target.value === "__custom" ? travel.accommodation : e.target.value)} disabled={!editable}>
              <option value="">Choose…</option>
              {ACCOMMODATION.map((a) => (
                <option key={a}>{a}</option>
              ))}
              {travel.accommodation && !ACCOMMODATION.includes(travel.accommodation) && <option value="__custom">{travel.accommodation}</option>}
            </Select>
          </Field>
          <Field label="Interpreter" htmlFor="t-lang">
            <Select id="t-lang" value={travel.interpreterLanguage || ""} onChange={(e) => set("interpreterLanguage", e.target.value)} disabled={!editable}>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l || "Not needed"}
                </option>
              ))}
              {travel.interpreterLanguage && !LANGS.includes(travel.interpreterLanguage) && <option>{travel.interpreterLanguage}</option>}
            </Select>
          </Field>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ink-700">
          <input type="checkbox" checked={travel.airportPickup ?? true} onChange={(e) => set("airportPickup", e.target.checked)} disabled={!editable} className="h-4 w-4 accent-brand-700" />
          <Car size={16} className="text-ink-400" aria-hidden /> Airport pickup on arrival
        </label>
        <Field label="Notes for the hospital" htmlFor="t-notes" optional className="mt-4">
          <Textarea id="t-notes" rows={2} value={travel.notes || ""} onChange={(e) => set("notes", e.target.value)} disabled={!editable} placeholder="Wheelchair assistance, dietary needs, prayer times…" />
        </Field>
        {editable && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs text-ink-400">
              <Hotel size={13} aria-hidden /> <Languages size={13} aria-hidden /> Shared with {hospital?.name} and your coordinator.
            </p>
            <Button disabled={busy} onClick={() => act("travel", { travel }, "Travel details saved")}>
              Save travel details
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
