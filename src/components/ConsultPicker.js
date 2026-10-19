"use client";
import { useMemo, useState } from "react";
import { Avatar, Select, cn } from "@/components/ui/core";
import { Price } from "@/components/ui/client";
import BookingWidget from "@/components/BookingWidget";
import { SPECIALTIES } from "@/content/specialties";

export default function ConsultPicker({ doctors, user, initialDoctor }) {
  const [specialty, setSpecialty] = useState(doctors.find((d) => d.slug === initialDoctor)?.specialty || "");
  const [slug, setSlug] = useState(initialDoctor && doctors.some((d) => d.slug === initialDoctor) ? initialDoctor : doctors[0]?.slug);
  const list = useMemo(() => doctors.filter((d) => !specialty || d.specialty === specialty), [doctors, specialty]);
  const doctor = doctors.find((d) => d.slug === slug);
  const specialties = SPECIALTIES.filter((s) => doctors.some((d) => d.specialty === s.name));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_440px]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink-900">1. Choose a specialist</h2>
          <Select aria-label="Filter by specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="h-11 w-auto py-0">
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => setSlug(d.slug)}
                aria-pressed={slug === d.slug}
                className={cn("flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left transition", slug === d.slug ? "border-brand-500 ring-4 ring-brand-500/15" : "border-line hover:border-ink-300")}
              >
                <Avatar name={d.name} src={d.image} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">{d.name}</span>
                  <span className="block truncate text-xs text-ink-500">
                    {d.specialty} · {d.hospital.city}
                  </span>
                </span>
                <span className="text-sm font-semibold text-ink-900">
                  <Price usd={d.consultFeeUSD} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-4 text-xl font-bold text-ink-900">2. Pick a time</h2>
        {doctor && <BookingWidget doctor={doctor} user={user} />}
      </div>
    </div>
  );
}
