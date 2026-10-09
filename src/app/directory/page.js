"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import Nav from "@/components/Nav";

const HOSPITAL_IMAGES = { h1: "/images/hospitals/hospital_1.jpg", h2: "/images/hospitals/hospital_2.jpg", h3: "/images/hospitals/hospital_3.jpg" };
// doctor_1/3/5 are female portraits, doctor_2/4/6 are male — mapped to match each doctor's name/gender
const DOCTOR_IMAGES = { d1: "/images/doctors/doctor_2.jpg", d2: "/images/doctors/doctor_1.jpg", d3: "/images/doctors/doctor_4.jpg", d4: "/images/doctors/doctor_3.jpg", d5: "/images/doctors/doctor_6.jpg", d6: "/images/doctors/doctor_5.jpg" };

function Rating({ rating, count }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6420]">
      <Star size={13} className="fill-[#D9A441] text-[#D9A441]" />
      {rating.toFixed(1)}
      <span className="text-[#9AADBD] font-normal">({count})</span>
    </span>
  );
}

export default function Directory() {
  const [tab, setTab] = useState("hospitals");
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");

  useEffect(() => {
    fetch("/api/hospitals").then((r) => r.json()).then(setHospitals);
    fetch("/api/doctors").then((r) => r.json()).then(setDoctors);
  }, []);

  const specialties = useMemo(() => {
    const all = new Set();
    hospitals.forEach((h) => h.specialties.forEach((s) => all.add(s)));
    doctors.forEach((d) => all.add(d.specialty));
    return ["All", ...Array.from(all).sort()];
  }, [hospitals, doctors]);

  const filteredHospitals = hospitals.filter((h) => {
    const matchesQuery = h.name.toLowerCase().includes(query.toLowerCase()) || h.city.toLowerCase().includes(query.toLowerCase());
    const matchesSpecialty = specialty === "All" || h.specialties.includes(specialty);
    return matchesQuery && matchesSpecialty;
  });

  const filteredDoctors = doctors.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
    const matchesSpecialty = specialty === "All" || d.specialty === specialty;
    return matchesQuery && matchesSpecialty;
  });

  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Directory</p>
        <h1 className="text-4xl font-extrabold mb-10">Verified hospitals &amp; specialists</h1>

        <div className="flex gap-3 mb-6">
          {["hospitals", "doctors"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? "wc-gradient text-white" : "bg-[#F7FAFD] text-[#5B7184] hover:bg-[#F3F7FC]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            placeholder={tab === "hospitals" ? "Search hospitals or cities..." : "Search doctors..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] focus:outline-none focus:ring-2 focus:ring-[#2F6FED]"
          >
            {specialties.map((s) => (
              <option key={s} value={s} className="bg-white">{s}</option>
            ))}
          </select>
        </div>

        {tab === "hospitals" ? (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredHospitals.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${card} overflow-hidden !p-0`}>
                {HOSPITAL_IMAGES[h.id] && (
                  <div className="relative w-full h-40">
                    <Image src={HOSPITAL_IMAGES[h.id]} alt={h.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-lg">{h.name}</p>
                  {h.verified && <span className="text-xs bg-[#2F6FED]/10 text-[#2F6FED] px-2.5 py-1 rounded-full font-semibold">Verified</span>}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[#5B7184] text-sm">{h.city}, {h.country} &middot; {h.accreditation}</p>
                  {h.rating && <Rating rating={h.rating} count={h.reviewCount} />}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {h.specialties.map((s) => (
                    <span key={s} className="text-xs bg-[#F7FAFD] border border-[#E3EAF2] px-2.5 py-1 rounded-full text-[#344A61]">{s}</span>
                  ))}
                </div>
                <p className="text-[#5B7184] text-xs">Languages: {h.languages.join(", ")} &middot; Last verified {h.lastVerified}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredDoctors.map((d, i) => {
              const h = hospitals.find((x) => x.id === d.hospitalId);
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${card} flex gap-4`}>
                  {DOCTOR_IMAGES[d.id] && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-[#E3EAF2]">
                      <Image src={DOCTOR_IMAGES[d.id]} alt={d.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                  <p className="font-bold text-lg">{d.name}</p>
                  <p className="text-[#2F6FED] text-sm font-semibold mt-1">{d.specialty}</p>
                  <p className="text-[#5B7184] text-sm mt-1">{h?.name} &middot; {d.experience}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {d.procedures.map((p) => (
                      <span key={p} className="text-xs bg-[#F7FAFD] border border-[#E3EAF2] px-2.5 py-1 rounded-full text-[#344A61]">{p}</span>
                    ))}
                  </div>
                  <p className="text-[#5B7184] text-xs mt-3">Languages: {d.languages.join(", ")}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
