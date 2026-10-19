"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DoctorCard } from "@/components/cards";
import { EmptyState, Select } from "@/components/ui/core";
import { SPECIALTIES } from "@/content/specialties";

export default function DoctorsBrowser({ doctors, initialSpecialty = "" }) {
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES.find((s) => s.slug === initialSpecialty)?.name || "");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [sort, setSort] = useState("experience");
  const countries = useMemo(() => [...new Set(doctors.map((d) => d.hospital.country))].sort(), [doctors]);
  const languages = useMemo(() => [...new Set(doctors.flatMap((d) => d.languages))].sort(), [doctors]);
  const specialties = SPECIALTIES.filter((s) => doctors.some((d) => d.specialty === s.name));

  const needle = q.trim().toLowerCase();
  const list = doctors
    .filter((d) => (!needle || `${d.name} ${d.specialty} ${d.procedures.join(" ")} ${d.hospital.name}`.toLowerCase().includes(needle)) && (!specialty || d.specialty === specialty) && (!country || d.hospital.country === country) && (!language || d.languages.includes(language)))
    .sort((a, b) => (sort === "fee" ? a.consultFeeUSD - b.consultFeeUSD : b.experienceYears - a.experienceYears));

  return (
    <div>
      <div className="card grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <label className="relative">
          <span className="sr-only">Search doctors</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, procedure or hospital" className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-[15px] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
        </label>
        <Select aria-label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
          <option value="">All specialties</option>
          {specialties.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">Any language</option>
          {languages.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
        <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="experience">Most experienced</option>
          <option value="fee">Lowest consult fee</option>
        </Select>
      </div>
      <p className="mt-6 text-sm text-ink-500">{list.length} specialists</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
      </div>
      {list.length === 0 && <EmptyState icon={Search} title="No doctors match these filters">Try a different specialty or country.</EmptyState>}
    </div>
  );
}
