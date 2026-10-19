"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select, FormError } from "@/components/ui/core";
import { api } from "@/components/ui/client";

export const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "UAE", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain", "Nigeria", "Kenya", "Ghana", "Ethiopia", "Tanzania", "Uganda", "South Africa", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Maldives", "Uzbekistan", "Iraq", "Somalia", "Indonesia", "Germany", "France", "Netherlands", "Ireland", "Other"];

export default function SignupForm({ next }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", country: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/auth/signup", { method: "POST", body: form });
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name" htmlFor="s-name">
        <Input id="s-name" required autoComplete="name" value={form.name} onChange={set("name")} />
      </Field>
      <Field label="Email" htmlFor="s-email">
        <Input id="s-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
      </Field>
      <Field label="Password" htmlFor="s-password" hint="8+ characters">
        <Input id="s-password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} />
      </Field>
      <Field label="Country you live in" htmlFor="s-country" optional>
        <Select id="s-country" value={form.country} onChange={set("country")}>
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={busy} size="lg" className="w-full">
        {busy ? "Creating account…" : "Create free account"}
      </Button>
      <p className="text-center text-xs text-ink-400">
        By creating an account you agree to the <Link href="/legal/terms" className="underline">terms</Link> and <Link href="/legal/privacy" className="underline">privacy policy</Link>.
      </p>
      <p className="text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
