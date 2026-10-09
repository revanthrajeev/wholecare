"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";

export default function Countries() {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    fetch("/api/countries").then((r) => r.json()).then(setGuides);
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Country Guides</p>
        <h1 className="text-4xl font-extrabold mb-10">Plan your destination</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((g, i) => (
            <motion.div key={g.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link href={`/countries/${g.slug}`} className="block rounded-2xl wc-card wc-card-hover overflow-hidden">
                <div className="relative w-full h-40">
                  <Image src={g.heroImage} alt={g.country} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="font-bold text-lg">{g.country}</p>
                  <p className="text-[#5B7184] text-sm mt-1">{g.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
