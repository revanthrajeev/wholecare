"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserRound, Building2, ShieldCheck, Headset } from "lucide-react";
import { Button, Field, Input, FormError } from "@/components/ui/core";
import { api } from "@/components/ui/client";

const DEMOS = [
  { icon: UserRound, label: "Patient", email: "demo.patient@wholecare.com", password: "demo123" },
  { icon: Building2, label: "Hospital", email: "apex@demo.com", password: "demo123" },
  { icon: Headset, label: "Coordinator", email: "care@wholecare.com", password: "care123" },
  { icon: ShieldCheck, label: "Admin", email: "admin@wholecare.com", password: "admin123" },
];

function destination(user, next) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    if (user.role === "hospital" && next.startsWith("/hospital")) return next === "/hospital" ? `/hospital/${user.hospitalId}` : next;
    if (user.role === "patient" && !next.startsWith("/hospital") && !next.startsWith("/admin")) return next;
    if ((user.role === "admin" || user.role === "coordinator") && !next.startsWith("/hospital")) return next;
  }
  if (user.role === "hospital") return `/hospital/${user.hospitalId}`;
  if (user.role === "admin" || user.role === "coordinator") return "/admin";
  return "/dashboard";
}

export default function LoginForm({ next }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e, creds) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await api("/api/auth/login", { method: "POST", body: creds || { email, password } });
      router.push(destination(user, next));
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={login} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:text-ink-700">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" disabled={busy} size="lg" className="w-full">
          {busy ? "Logging in…" : "Log in"}
        </Button>
        <p className="text-center text-sm text-ink-500">
          New here?{" "}
          <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
            Create a free account
          </Link>{" "}
          · Hospital?{" "}
          <Link href="/signup/hospital" className="font-semibold text-brand-700 hover:underline">
            List it
          </Link>
        </p>
      </form>

      <div className="mt-10 rounded-3xl border border-dashed border-ink-200 bg-white p-5">
        <p className="text-sm font-semibold text-ink-900">Explore with a demo account</p>
        <p className="mt-0.5 text-xs text-ink-500">Sample data — try each side of the platform.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {DEMOS.map((d) => (
            <button
              key={d.label}
              type="button"
              disabled={busy}
              onClick={() => login(null, { email: d.email, password: d.password })}
              className="flex items-center gap-2.5 rounded-2xl border border-line px-3 py-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-50"
            >
              <d.icon size={18} className="text-brand-600" aria-hidden />
              <span>
                <span className="block text-sm font-semibold text-ink-900">{d.label}</span>
                <span className="block truncate text-[11px] text-ink-400">{d.email}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
