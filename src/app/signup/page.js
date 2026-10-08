"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
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
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-md mx-auto px-6 pt-40 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Get started</p>
        <h1 className="text-3xl font-extrabold mb-8">Create your patient account</h1>

        <form onSubmit={submit} className="rounded-2xl p-8 wc-card space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Full name</label>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Email</label>
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Password</label>
            <input required type="password" minLength={6} className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="text-xs text-[#9AADBD] mt-1">At least 6 characters.</p>
          </div>
          {error && <p className="text-sm text-[#C23B5A] font-medium">{error}</p>}
          <button disabled={loading} className="w-full btn-grad py-3 rounded-xl font-bold disabled:opacity-50">
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-sm text-[#5B7184] text-center pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2F6FED] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
