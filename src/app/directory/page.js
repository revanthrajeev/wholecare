"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";

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
    <main className="min-h-screen bg-[#05090d] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#8fd6cc] font-bold tracking-wide uppercase text-sm mb-2">Directory</p>
        <h1 className="text-4xl font-extrabold mb-10">Verified hospitals &amp; specialists</h1>

        <div className="flex gap-3 mb-6">
          {["hospitals", "doctors"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? "bg-[#8fd6cc] text-[#0a1c30]" : "bg-white/5 text-[#9db3c4] hover:bg-white/10"
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
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#4B5D6B] focus:outline-none focus:ring-2 focus:ring-[#8fd6cc]"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8fd6cc]"
          >
            {specialties.map((s) => (
              <option key={s} value={s} className="bg-[#0a1626]">{s}</option>
            ))}
          </select>
        </div>

        {tab === "hospitals" ? (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredHospitals.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={card}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-lg">{h.name}</p>
                  {h.verified && <span className="text-xs bg-[#8fd6cc]/15 text-[#8fd6cc] px-2.5 py-1 rounded-full font-semibold">Verified</span>}
                </div>
                <p className="text-[#9db3c4] text-sm mb-3">{h.city}, {h.country} &middot; {h.accreditation}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {h.specialties.map((s) => (
                    <span key={s} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#cfe0e8]">{s}</span>
                  ))}
                </div>
                <p className="text-[#4B5D6B] text-xs">Languages: {h.languages.join(", ")} &middot; Last verified {h.lastVerified}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredDoctors.map((d, i) => {
              const h = hospitals.find((x) => x.id === d.hospitalId);
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={card}>
                  <p className="font-bold text-lg">{d.name}</p>
                  <p className="text-[#8fd6cc] text-sm font-semibold mt-1">{d.specialty}</p>
                  <p className="text-[#9db3c4] text-sm mt-1">{h?.name} &middot; {d.experience}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {d.procedures.map((p) => (
                      <span key={p} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[#cfe0e8]">{p}</span>
                    ))}
                  </div>
                  <p className="text-[#4B5D6B] text-xs mt-3">Languages: {d.languages.join(", ")}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
