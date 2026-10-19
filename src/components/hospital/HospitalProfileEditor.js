"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, CheckCircle2, CircleDashed } from "lucide-react";
import { Button, Field, Input, Textarea, cn } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";
import { SPECIALTIES } from "@/content/specialties";

const SERVICES = ["Airport pickup", "Interpreters", "Visa invitation letter", "Accommodation help", "Halal meals", "Prayer room", "International patient lounge", "Family suites", "Hotel desk", "Dietitian follow-up"];

export default function HospitalProfileEditor({ hospital: h }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    description: h.description || "",
    highlights: (h.highlights || []).join("\n"),
    languages: (h.languages || []).join(", "),
    beds: h.beds || "",
    established: h.established || "",
    verificationRequest: "",
  });
  const [specialties, setSpecialties] = useState(h.specialties || []);
  const [services, setServices] = useState(h.services || []);
  const [busy, setBusy] = useState(false);
  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function save() {
    setBusy(true);
    try {
      await api("/api/hospital/profile", {
        method: "PATCH",
        body: { ...form, highlights: form.highlights.split("\n"), languages: form.languages.split(","), specialties, services },
      });
      toast(form.verificationRequest ? "Saved — the Whole Care team will review your verification request." : "Profile saved");
      setForm((f) => ({ ...f, verificationRequest: "" }));
      router.refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  const v = h.verification || {};
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Link href={`/hospital/${h.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft size={16} aria-hidden /> Back to portal
        </Link>
        <section className="card space-y-4 p-6">
          <p className="font-bold text-ink-900">About your hospital</p>
          <Field label="Description" htmlFor="p-desc" hint="shown at the top of your public profile">
            <Textarea id="p-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Highlights" htmlFor="p-high" hint="one per line, up to 6">
            <Textarea id="p-high" rows={4} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Languages" htmlFor="p-lang" hint="comma-separated">
              <Input id="p-lang" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
            </Field>
            <Field label="Beds" htmlFor="p-beds">
              <Input id="p-beds" type="number" min="0" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
            </Field>
            <Field label="Established" htmlFor="p-est">
              <Input id="p-est" type="number" min="1800" max="2026" value={form.established} onChange={(e) => setForm({ ...form, established: e.target.value })} />
            </Field>
          </div>
        </section>
        <section className="card p-6">
          <p className="font-bold text-ink-900">Specialties</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button key={s.slug} type="button" onClick={() => toggle(specialties, setSpecialties, s.name)} aria-pressed={specialties.includes(s.name)} className={cn("rounded-full px-3 py-1.5 text-sm transition", specialties.includes(s.name) ? "bg-ink-900 font-semibold text-white" : "bg-white text-ink-600 ring-1 ring-line")}>
                {s.name}
              </button>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <p className="font-bold text-ink-900">International patient services</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...new Set([...SERVICES, ...services])].map((s) => (
              <button key={s} type="button" onClick={() => toggle(services, setServices, s)} aria-pressed={services.includes(s)} className={cn("rounded-full px-3 py-1.5 text-sm transition", services.includes(s) ? "bg-brand-700 font-semibold text-white" : "bg-white text-ink-600 ring-1 ring-line")}>
                {s}
              </button>
            ))}
          </div>
        </section>
        <div className="flex justify-end">
          <Button size="lg" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
      <aside className="space-y-5">
        <section className="card p-5">
          <p className="flex items-center gap-2 font-bold text-ink-900">
            <ShieldCheck size={18} className="text-brand-600" aria-hidden /> Verification
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["license", "Operating licence"],
              ["accreditation", "Accreditation certificates"],
              ["intlDesk", "International patient desk"],
              ["siteVisit", "Site visit (optional)"],
            ].map(([k, l]) => (
              <li key={k} className="flex items-center gap-2">
                {v[k] ? <CheckCircle2 size={17} className="text-ok-600" aria-hidden /> : <CircleDashed size={17} className="text-ink-300" aria-hidden />}
                <span className={v[k] ? "text-ink-800" : "text-ink-500"}>{l}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-500">{h.verified ? "Your profile is live." : "Your profile goes live once licence, accreditation and international desk are confirmed."}</p>
          <Textarea rows={3} className="mt-4 text-sm" value={form.verificationRequest} onChange={(e) => setForm({ ...form, verificationRequest: e.target.value })} placeholder="Message for the verification team — e.g. where to find your licence and accreditation certificates" aria-label="Verification request" />
          <p className="mt-2 text-xs text-ink-400">Upload certificates in any case room or send them via the contact page; our team confirms them with the issuing body.</p>
        </section>
      </aside>
    </div>
  );
}
