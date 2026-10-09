"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    if (data.role === "hospital") {
      router.push(`/hospital/${data.hospitalId}`);
    } else {
      router.push(params.get("next") || "/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-md mx-auto px-6 pt-40 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Welcome back</p>
        <h1 className="text-3xl font-extrabold mb-8">Log in to Whole Care</h1>

        <form onSubmit={submit} className="rounded-2xl p-8 wc-card space-y-4">
          <div>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Email</label>
            <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#5B7184] mb-2 block">Password</label>
            <input required type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-[#C23B5A] font-medium">{error}</p>}
          <button disabled={loading} className="w-full btn-grad py-3 rounded-xl font-bold disabled:opacity-50">
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p className="text-sm text-[#5B7184] text-center pt-2">
            New patient?{" "}
            <Link href="/signup" className="text-[#2F6FED] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-2xl p-5 bg-[#F3F7FC] border border-[#E3EAF2] text-xs text-[#5B7184] space-y-2">
          <div>
            <p className="font-semibold text-[#344A61]">Demo patient login</p>
            <p>demo.patient@wholecare.com &mdash; password: demo123 (has 2 sample cases)</p>
          </div>
          <div>
            <p className="font-semibold text-[#344A61]">Demo hospital logins</p>
            <p>apex@demo.com / sunrise@demo.com / horizon@demo.com &mdash; password: demo123</p>
          </div>
        </div>
      </div>
    </main>
  );
}
