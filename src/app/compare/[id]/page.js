"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function Compare() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/cases/${id}`).then((r) => r.json()).then(setData);
  }, [id]);

  if (!data) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;
  const { case: c, quotations, hospitals } = data;

  const rows = [
    { label: "Hospital", key: (q, h) => h?.name },
    { label: "City / Country", key: (q, h) => `${h?.city}, ${h?.country}` },
    { label: "Accreditation", key: (q, h) => h?.accreditation },
    { label: "Procedure", key: (q) => q.procedure },
    { label: "Doctor", key: (q) => q.doctor },
    { label: "Hospital stay", key: (q) => `${q.hospitalStayDays} days` },
    { label: "Estimated cost", key: (q) => q.estimatedCost, highlight: true },
    { label: "Exclusions", key: (q) => q.exclusions || "—" },
    { label: "Quote validity", key: (q) => `${q.validityDays} days` },
  ];

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <Link href={`/case/${id}`} className="text-[#2F6FED] text-sm font-semibold mb-4 inline-block hover:underline">&larr; Back to case</Link>
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-1">Quotation Comparison</p>
        <h1 className="text-3xl font-extrabold mb-8">{c.patientName}&rsquo;s options</h1>

        {quotations.length === 0 ? (
          <p className="text-[#5B7184]">No quotations yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl wc-card">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-[#E3EAF2] last:border-0">
                    <td className="p-4 font-semibold text-[#5B7184] w-48 bg-[#F7FAFD]">{row.label}</td>
                    {quotations.map((q) => {
                      const h = hospitals.find((x) => x.id === q.hospitalId);
                      return (
                        <td key={q.id} className={`p-4 ${row.highlight ? "font-extrabold text-[#2F6FED] text-lg" : ""}`}>
                          {row.key(q, h)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
