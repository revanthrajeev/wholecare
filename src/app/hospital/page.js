"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function HospitalSelect() {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    fetch("/api/hospitals").then((r) => r.json()).then(setHospitals);
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Hospital Portal</p>
        <h1 className="text-4xl font-extrabold mb-10">Select your hospital (demo login)</h1>
        <div className="grid grid-cols-1 gap-4">
          {hospitals.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link
                href={`/hospital/${h.id}`}
                className="block rounded-2xl p-6 wc-card wc-card-hover hover:border-[#2F6FED]/40 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-lg">{h.name}</p>
                  <p className="text-[#5B7184] text-sm mt-1">{h.city}, {h.country} &middot; {h.accreditation}</p>
                </div>
                <span className="text-[#2F6FED] font-semibold">Open dashboard &rarr;</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
