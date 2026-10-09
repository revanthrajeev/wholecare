"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function HospitalSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", city: "", country: "", accreditation: "", specialties: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";
  const labelClass = "text-sm font-semibold text-[#5B7184] mb-2 block";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup-hospital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Signup failed.");
      return;
    }
    router.push(`/hospital/${data.hospitalId}`);
  }

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-xl mx-auto px-6 pt-36 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Hospital Partner Signup</p>
        <h1 className="text-3xl font-extrabold mb-3">List your hospital on Whole Care</h1>
        <p className="text-[#5B7184] mb-8 text-sm">Your profile goes live for internal review immediately, but won&rsquo;t appear as &ldquo;Verified&rdquo; in the public directory until our team confirms your accreditation.</p>

        <form onSubmit={submit} className="rounded-2xl p-8 wc-card space-y-4">
          <div>
            <label className={labelClass}>Hospital name</label>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input required className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input required className={inputClass} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Accreditation (optional)</label>
            <input className={inputClass} placeholder="e.g. JCI Accredited" value={form.accreditation} onChange={(e) => setForm({ ...form, accreditation: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Specialties (comma-separated)</label>
            <input required className={inputClass} placeholder="e.g. Cardiac Surgery, Orthopedics" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Contact email</label>
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input required type="password" minLength={6} className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="text-sm text-[#C23B5A] font-medium">{error}</p>}
          <button disabled={loading} className="w-full btn-grad py-3 rounded-xl font-bold disabled:opacity-50">
            {loading ? "Submitting..." : "Create hospital account"}
          </button>
          <p className="text-sm text-[#5B7184] text-center pt-2">
            Already a partner?{" "}
            <Link href="/login" className="text-[#2F6FED] font-semibold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
