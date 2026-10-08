"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Nav from "@/components/Nav";

const STAGE_COLOR = {
  Submitted: "#5B7184",
  "Under Review": "#8A6420",
  "Sent to Hospitals": "#2F6FED",
  "Quotation Received": "#C23B5A",
  Confirmed: "#1E9E6B",
  Completed: "#1E9E6B",
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [cases, setCases] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) {
        router.push("/login?next=/dashboard");
        return;
      }
      setUser(d.user);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/cases").then((r) => r.json()).then((d) => setCases(Array.isArray(d) ? d : []));
  }, [user]);

  if (user === undefined || cases === null) {
    return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;
  }

  const card = "rounded-2xl p-6 wc-card wc-card-hover";

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-1">My Cases</p>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-extrabold">Welcome, {user.name || user.email}</h1>
          <Link href="/case/new" className="btn-grad text-sm font-bold px-5 py-2.5 rounded-full">
            + New Case
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className={`${card} text-center py-16`}>
            <p className="text-[#5B7184] mb-4">You haven&rsquo;t started a case yet.</p>
            <Link href="/case/new" className="btn-grad inline-block text-sm font-bold px-6 py-3 rounded-full">
              Start your first case
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/case/${c.id}`} className={`${card} block flex items-center justify-between`}>
                  <div>
                    <p className="font-bold">{c.patientName}</p>
                    <p className="text-[#344A61] text-sm mt-1">{c.condition}</p>
                    <p className="text-[#5B7184] text-xs mt-1">
                      {c.countryOfResidence} &rarr; {c.preferredDestination} &middot; Created {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
                    style={{ color: STAGE_COLOR[c.stage] || "#5B7184", backgroundColor: "#F3F7FC" }}
                  >
                    {c.stage}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
