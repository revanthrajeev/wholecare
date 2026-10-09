"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Nav from "@/components/Nav";

export default function CountryGuide() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/countries/${slug}`).then((r) => r.json()).then(setData);
  }, [slug]);

  if (!data) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;
  if (data.error) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Guide not found.</main>;

  const { guide, hospitals } = data;
  const card = "rounded-2xl p-6 wc-card";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="relative h-72 w-full overflow-hidden">
        <Image src={guide.heroImage} alt={guide.country} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A52] via-[#0F2A52]/30 to-transparent" />
        <div className="absolute bottom-8 left-6 sm:left-10 text-white max-w-2xl">
          <p className="font-eyebrow text-xs uppercase tracking-widest text-[#6FA8F5] mb-2">Country Guide</p>
          <h1 className="font-display text-4xl md:text-5xl">{guide.country}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <p className="text-lg text-[#344A61]">{guide.tagline}</p>

          <div className={card}>
            <h2 className="font-bold mb-4">Why choose {guide.country}</h2>
            <ul className="space-y-2.5 text-sm">
              {guide.whyChoose.map((w) => (
                <li key={w} className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#2F6FED] mt-0.5 shrink-0" />
                  <span className="text-[#344A61]">{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={card}>
            <h2 className="font-bold mb-4">Hospitals in {guide.country}</h2>
            <div className="space-y-3">
              {hospitals.map((h) => (
                <Link key={h.id} href="/directory" className="block border border-[#E3EAF2] rounded-xl p-4 hover:border-[#2F6FED]/40 transition text-sm">
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-[#5B7184]">{h.city} &middot; {h.accreditation} &middot; {h.rating}★</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={card}>
            <h2 className="font-bold mb-3 text-sm">Visa</h2>
            <p className="text-sm font-semibold">{guide.visa.type}</p>
            <p className="text-[#5B7184] text-sm mt-1">{guide.visa.duration}</p>
            <p className="text-[#9AADBD] text-xs mt-2">{guide.visa.notes}</p>
          </div>
          <div className={card}>
            <h2 className="font-bold mb-3 text-sm">Good to know</h2>
            <dl className="text-sm space-y-2">
              <div><dt className="text-[#5B7184] text-xs">Best time to visit</dt><dd className="font-medium">{guide.bestTimeToVisit}</dd></div>
              <div><dt className="text-[#5B7184] text-xs">Currency</dt><dd className="font-medium">{guide.currency}</dd></div>
              <div><dt className="text-[#5B7184] text-xs">Major cities</dt><dd className="font-medium">{guide.cities.join(", ")}</dd></div>
            </dl>
          </div>
          <Link href="/case/new" className="btn-grad block text-center py-3.5 rounded-xl font-bold">
            Start a case for {guide.country}
          </Link>
        </div>
      </div>
    </main>
  );
}
