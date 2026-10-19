"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select, Textarea, FormError, cn } from "@/components/ui/core";
import { api } from "@/components/ui/client";
import { SPECIALTIES } from "@/content/specialties";
import { DESTINATIONS } from "@/content/destinations";

export default function HospitalSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", city: "", country: "India", accreditation: "", description: "", beds: "", established: "", email: "", password: "" });
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (s) => setSpecialties((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await api("/api/auth/signup-hospital", { method: "POST", body: { ...form, specialties } });
      router.push(`/hospital/${user.hospitalId}?welcome=1`);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Hospital name" htmlFor="h-name">
        <Input id="h-name" required value={form.name} onChange={set("name")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City" htmlFor="h-city">
          <Input id="h-city" required value={form.city} onChange={set("city")} />
        </Field>
        <Field label="Country" htmlFor="h-country">
          <Select id="h-country" value={form.country} onChange={set("country")}>
            {DESTINATIONS.map((d) => (
              <option key={d.slug}>{d.country}</option>
            ))}
            <option>Other</option>
          </Select>
        </Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-700">Specialties</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button key={s.slug} type="button" onClick={() => toggle(s.name)} aria-pressed={specialties.includes(s.name)} className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition", specialties.includes(s.name) ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <Field label="Accreditations" htmlFor="h-accr" hint="comma-separated" optional>
        <Input id="h-accr" placeholder="e.g. JCI, NABH" value={form.accreditation} onChange={set("accreditation")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Beds" htmlFor="h-beds" optional>
          <Input id="h-beds" type="number" min="0" value={form.beds} onChange={set("beds")} />
        </Field>
        <Field label="Year established" htmlFor="h-est" optional>
          <Input id="h-est" type="number" min="1800" max="2026" value={form.established} onChange={set("established")} />
        </Field>
      </div>
      <Field label="Short description" htmlFor="h-desc" optional>
        <Textarea id="h-desc" rows={3} value={form.description} onChange={set("description")} placeholder="What your hospital is known for, and your international patient services." />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Work email" htmlFor="h-email">
          <Input id="h-email" type="email" required value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Password" htmlFor="h-pass" hint="8+ characters">
          <Input id="h-pass" type="password" required minLength={8} value={form.password} onChange={set("password")} />
        </Field>
      </div>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={busy} size="lg" className="w-full">
        {busy ? "Creating…" : "Create hospital account"}
      </Button>
      <p className="text-center text-xs text-ink-400">Your profile stays private until our team completes verification. Already a partner? <Link href="/login?next=/hospital" className="underline">Log in</Link></p>
    </form>
  );
}
