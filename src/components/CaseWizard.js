"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, UploadCloud, FileText, X, Search, Building2, Stethoscope, ShieldCheck, Lock, Package } from "lucide-react";
import { Button, Field, Input, Select, Textarea, FormError, Avatar, cn } from "@/components/ui/core";
import { PriceRange, api } from "@/components/ui/client";
import { TREATMENTS } from "@/content/treatments";
import { SPECIALTIES } from "@/content/specialties";
import { DESTINATION_CHOICES, FILE_CATEGORIES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { COUNTRIES } from "@/components/SignupForm";
import { useIsClient } from "@/lib/useIsClient";

const DRAFT = "wc-wizard-draft-v1";
const BUDGETS = ["Under $5,000", "$5,000–10,000", "$10,000–20,000", "$20,000–40,000", "$40,000+", "Not sure yet"];
const TIMELINES = ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Just exploring"];
const OK_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".dcm", ".doc", ".docx"];

function fmtSize(b) {
  return b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`;
}

function Dropzone({ files, setFiles }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [warn, setWarn] = useState("");
  function add(list) {
    setWarn("");
    const next = [...files];
    for (const f of Array.from(list)) {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      if (!OK_EXT.includes(ext)) {
        setWarn(`${f.name}: use PDF, JPG, PNG, WEBP, DICOM or Word files.`);
        continue;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        setWarn(`${f.name} is over 15 MB — export a smaller PDF or share imaging later.`);
        continue;
      }
      if (next.length >= 10) {
        setWarn("Up to 10 files here — you can add more from your case room.");
        break;
      }
      next.push({ file: f, category: /scan|mri|ct|xray|x-ray|dcm|echo|angio/i.test(f.name) ? "scan" : /lab|blood/i.test(f.name) ? "lab" : "report", id: `${f.name}-${f.size}-${Math.random()}` });
    }
    setFiles(next);
  }
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn("flex cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition", drag ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300")}
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <UploadCloud size={26} aria-hidden />
        </span>
        <p className="mt-4 font-semibold text-ink-900">Drop reports here or click to browse</p>
        <p className="mt-1 text-sm text-ink-500">PDF, JPG, PNG, DICOM or Word · up to 15 MB each</p>
        <input ref={input} type="file" multiple accept={OK_EXT.join(",")} className="hidden" onChange={(e) => add(e.target.files)} />
      </div>
      {warn && <p className="mt-3 text-sm font-medium text-coral-700">{warn}</p>}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <FileText size={20} className="shrink-0 text-brand-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{f.file.name}</p>
                <p className="text-xs text-ink-400">{fmtSize(f.file.size)}</p>
              </div>
              <select aria-label={`Type of ${f.file.name}`} value={f.category} onChange={(e) => setFiles(files.map((x) => (x.id === f.id ? { ...x, category: e.target.value } : x)))} className="rounded-xl border border-line bg-white px-2 py-1.5 text-xs text-ink-700">
                {FILE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setFiles(files.filter((x) => x.id !== f.id))} aria-label={`Remove ${f.file.name}`} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TreatmentPicker({ value, onChange }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TREATMENTS.filter((tr) => !t || `${tr.name} ${tr.specialty}`.toLowerCase().includes(t));
  }, [q]);
  const selected = TREATMENTS.find((t) => t.slug === value);
  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search treatments</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search treatments" className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
      </label>
      <div className="mt-3 grid grid-cols-1 max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {list.map((t) => (
          <button key={t.slug} type="button" onClick={() => onChange(t.slug)} aria-pressed={value === t.slug} className={cn("rounded-2xl border p-3 text-left transition", value === t.slug ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-line bg-white hover:border-ink-300")}>
            <span className="block text-sm font-semibold text-ink-900">{t.name}</span>
            <span className="block text-xs text-ink-500">{t.specialty}</span>
          </button>
        ))}
        <button type="button" onClick={() => onChange("other")} aria-pressed={value === "other"} className={cn("rounded-2xl border border-dashed p-3 text-left transition", value === "other" ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300")}>
          <span className="block text-sm font-semibold text-ink-900">Something else / not sure</span>
          <span className="block text-xs text-ink-500">Describe it in the next step</span>
        </button>
      </div>
      {selected && !selected.priceOnAssessment && (
        <p className="mt-3 text-sm text-ink-500">
          Typical range from <span className="font-semibold text-ink-900"><PriceRange low={Math.min(...Object.values(selected.prices).map((r) => r[0]))} high={Math.min(...Object.values(selected.prices).map((r) => r[1]))} /></span> depending on country.
        </p>
      )}
    </div>
  );
}

export default function CaseWizard({ mode = "quote", user, prefill = {} }) {
  const router = useRouter();
  const second = mode === "second_opinion";
  const steps = second ? ["Specialist", "Your case", "Reports", "Review & send"] : ["Treatment", "Patient", "Reports", "Review & send"];
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [form, setForm] = useState({
    treatmentSlug: prefill.treatment || "",
    specialty: prefill.specialty || "",
    preferredDestination: prefill.destination || "",
    hospitalSlug: prefill.hospital?.slug || "",
    doctorSlug: prefill.doctor?.slug || "",
    packageId: prefill.package?.id || "",
    relationship: "self",
    patientName: user?.name || "",
    patientAge: "",
    countryOfResidence: user?.country || "",
    condition: "",
    existingTreatment: "",
    questions: "",
    budgetRange: "",
    timeline: "",
    consent: false,
    account: { name: "", email: "", password: "" },
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Restore an unfinished request from this tab once the page is interactive; save only after that check.
  const isClient = useIsClient();
  const [draftChecked, setDraftChecked] = useState(false);
  if (isClient && !draftChecked) {
    setDraftChecked(true);
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT) || "null");
      if (d && d.mode === mode) {
        setForm((f) => ({ ...f, ...d.form, account: f.account, consent: false, hospitalSlug: prefill.hospital?.slug || d.form.hospitalSlug, treatmentSlug: prefill.treatment || d.form.treatmentSlug }));
        setStep(Math.min(d.step || 0, 2));
      }
    } catch {}
  }
  useEffect(() => {
    if (!draftChecked) return;
    try {
      const { account, consent, ...rest } = form;
      sessionStorage.setItem(DRAFT, JSON.stringify({ mode, step, form: rest }));
    } catch {}
  }, [draftChecked, form, step, mode]);

  const treatment = TREATMENTS.find((t) => t.slug === form.treatmentSlug);

  function validate(s) {
    if (s === 0) {
      if (second && !form.specialty && !form.doctorSlug) return "Choose the specialty you need an opinion from.";
      if (second && form.questions.trim().length < 10) return "Tell the specialist what you'd like answered.";
      if (!second && !form.treatmentSlug) return "Choose a treatment — or pick “Something else”.";
    }
    if (s === 1) {
      if (!form.patientName.trim()) return "Enter the patient's name.";
      if (form.condition.trim().length < 10) return "Describe the condition in a sentence or two.";
    }
    if (s === 3) {
      if (!user) {
        if (!form.account.name.trim()) return "Enter your name for the account.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.account.email)) return "Enter a valid email.";
        if (form.account.password.length < 8) return "Choose a password of at least 8 characters.";
      }
      if (!form.consent) return "Please tick the consent box to continue.";
    }
    return "";
  }

  function next() {
    const v = validate(step);
    if (v) return setError(v);
    setError("");
    setStep((s) => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const v = validate(3) || validate(1) || validate(0);
    if (v) return setError(v);
    setError("");
    setBusy(true);
    try {
      if (!user) {
        setProgress("Creating your account…");
        await api("/api/auth/signup", { method: "POST", body: { ...form.account, country: form.countryOfResidence } });
      }
      setProgress(second ? "Submitting your request…" : "Creating your case…");
      const c = await api("/api/cases", {
        method: "POST",
        body: {
          type: second ? "second_opinion" : "treatment",
          treatmentSlug: form.treatmentSlug === "other" ? null : form.treatmentSlug,
          specialty: form.specialty || treatment?.specialty || "",
          preferredDestination: form.preferredDestination,
          hospitalSlug: form.hospitalSlug || undefined,
          doctorSlug: form.doctorSlug || undefined,
          packageId: form.packageId || undefined,
          relationship: form.relationship,
          patientName: form.patientName,
          patientAge: form.patientAge,
          countryOfResidence: form.countryOfResidence,
          condition: form.condition,
          existingTreatment: form.existingTreatment,
          questions: form.questions,
          budgetRange: form.budgetRange,
          timeline: form.timeline,
          consent: form.consent,
        },
      });
      const groups = {};
      for (const f of files) (groups[f.category] ||= []).push(f.file);
      let n = 0;
      for (const [category, list] of Object.entries(groups)) {
        setProgress(`Uploading reports (${(n += list.length)}/${files.length})…`);
        const fd = new FormData();
        fd.append("category", category);
        list.forEach((f) => fd.append("files", f));
        await api(`/api/cases/${c.id}/files`, { method: "POST", form: fd });
      }
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {}
      router.push(`/case/${c.id}?welcome=1`);
      router.refresh();
    } catch (err) {
      setError(err.status === 409 && !user ? `${err.message}` : err.message);
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step} className="w-full text-left" aria-current={i === step ? "step" : undefined}>
              <span className="block h-1.5 overflow-hidden rounded-full bg-ink-100">
                <motion.span className="block h-full rounded-full bg-brand-600" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.5 }} />
              </span>
              <span className={cn("mt-2 flex items-center gap-1.5 text-xs font-semibold sm:text-sm", i <= step ? "text-ink-900" : "text-ink-400")}>
                {i < step ? <Check size={14} className="text-brand-600" aria-hidden /> : <span className="text-ink-400">{i + 1}.</span>}
                <span className="truncate">{s}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="card p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
            {step === 0 && !second && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">What treatment are you considering?</h2>
                  <p className="mt-1 text-sm text-ink-500">Not sure? Choose “Something else” — a coordinator will help.</p>
                </div>
                {prefill.package && (
                  <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
                    <Package size={18} aria-hidden /> Requesting package: <span className="font-semibold">{prefill.package.title}</span>
                  </div>
                )}
                <TreatmentPicker value={form.treatmentSlug} onChange={(v) => set("treatmentSlug", v)} />
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink-700">Preferred destination</p>
                  <div className="flex flex-wrap gap-2">
                    {DESTINATION_CHOICES.map((d) => {
                      const has = !treatment || d === "Not sure yet" || treatment.priceOnAssessment || treatment.prices[d];
                      return (
                        <button key={d} type="button" disabled={!has} onClick={() => set("preferredDestination", form.preferredDestination === d ? "" : d)} aria-pressed={form.preferredDestination === d} className={cn("rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-35", form.preferredDestination === d ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {prefill.hospital && form.hospitalSlug && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
                    <span className="flex items-center gap-3 text-sm">
                      <Building2 size={18} className="text-brand-600" aria-hidden />
                      <span>
                        Sending directly to <span className="font-semibold text-ink-900">{prefill.hospital.name}</span>
                        <span className="block text-xs text-ink-500">You can add more hospitals from your case room.</span>
                      </span>
                    </span>
                    <button type="button" onClick={() => set("hospitalSlug", "")} className="text-xs font-semibold text-ink-500 hover:text-ink-900">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 0 && second && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Which specialist should review your case?</h2>
                  <p className="mt-1 text-sm text-ink-500">Your coordinator assigns the right specialist if you&rsquo;re unsure.</p>
                </div>
                {prefill.doctor && form.doctorSlug ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
                    <span className="flex items-center gap-3">
                      <Avatar name={prefill.doctor.name} src={prefill.doctor.image} size={44} />
                      <span>
                        <span className="block font-semibold text-ink-900">{prefill.doctor.name}</span>
                        <span className="block text-xs text-ink-500">{prefill.doctor.specialty}</span>
                      </span>
                    </span>
                    <button type="button" onClick={() => set("doctorSlug", "")} className="text-xs font-semibold text-ink-500 hover:text-ink-900">
                      Choose specialty instead
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <button key={s.slug} type="button" onClick={() => set("specialty", s.name)} aria-pressed={form.specialty === s.name} className={cn("rounded-full px-4 py-2 text-sm font-medium transition", form.specialty === s.name ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                <Field label="What would you like the specialist to answer?" htmlFor="w-questions">
                  <Textarea id="w-questions" rows={5} value={form.questions} onChange={(e) => set("questions", e.target.value)} placeholder="e.g. Is surgery needed now, or are there other options? If surgery is needed, which approach would you recommend for someone my age?" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-ink-900">About the patient</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["self", "For me"],
                    ["family", "For a family member"],
                    ["other", "For someone I care for"],
                  ].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set("relationship", v)} aria-pressed={form.relationship === v} className={cn("rounded-full px-4 py-2 text-sm font-medium transition", form.relationship === v ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
                  <Field label="Patient's full name" htmlFor="w-name">
                    <Input id="w-name" value={form.patientName} onChange={(e) => set("patientName", e.target.value)} autoComplete="name" />
                  </Field>
                  <Field label="Age" htmlFor="w-age" optional>
                    <Input id="w-age" type="number" min="0" max="119" value={form.patientAge} onChange={(e) => set("patientAge", e.target.value)} />
                  </Field>
                </div>
                <Field label="Country of residence" htmlFor="w-country">
                  <Select id="w-country" value={form.countryOfResidence} onChange={(e) => set("countryOfResidence", e.target.value)}>
                    <option value="">Select…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Condition or diagnosis, in your words" htmlFor="w-condition">
                  <Textarea id="w-condition" rows={4} value={form.condition} onChange={(e) => set("condition", e.target.value)} placeholder="e.g. Severe arthritis in the right knee; my orthopaedic surgeon recommended a total knee replacement." />
                </Field>
                <Field label="Treatment so far" htmlFor="w-existing" optional>
                  <Textarea id="w-existing" rows={2} value={form.existingTreatment} onChange={(e) => set("existingTreatment", e.target.value)} placeholder="Medication, physiotherapy, previous surgery, tests done…" />
                </Field>
                {!second && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Budget" htmlFor="w-budget" optional>
                      <Select id="w-budget" value={form.budgetRange} onChange={(e) => set("budgetRange", e.target.value)}>
                        <option value="">Prefer not to say</option>
                        {BUDGETS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Timing" htmlFor="w-timeline" optional>
                      <Select id="w-timeline" value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
                        <option value="">Flexible</option>
                        {TIMELINES.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Add your reports</h2>
                  <p className="mt-1 text-sm text-ink-500">{second ? "A specialist can only give a useful opinion with your reports — imaging, pathology and your doctor's letter." : "Hospitals quote accurately only from real reports. Add what you have — you can upload more later."}</p>
                </div>
                <Dropzone files={files} setFiles={setFiles} />
                <p className="flex items-center gap-2 text-xs text-ink-500">
                  <Lock size={14} aria-hidden /> Files are visible only to you, your coordinator and hospitals you send your case to. Every access is logged.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-ink-900">Review &amp; send</h2>
                <dl className="divide-y divide-line rounded-2xl border border-line text-sm">
                  {[
                    [second ? "Opinion from" : "Treatment", second ? form.doctorSlug && prefill.doctor ? prefill.doctor.name : form.specialty || "—" : treatment?.name || (form.treatmentSlug === "other" ? "Not sure / other" : "—")],
                    ...(second ? [["Questions", form.questions]] : [["Destination", form.preferredDestination || "Not sure yet"]]),
                    ["Patient", `${form.patientName}${form.patientAge ? `, ${form.patientAge}` : ""}${form.countryOfResidence ? ` · ${form.countryOfResidence}` : ""}`],
                    ["Condition", form.condition],
                    ["Reports", files.length ? `${files.length} file${files.length > 1 ? "s" : ""}` : "None yet"],
                    ...(form.hospitalSlug && prefill.hospital ? [["Send to", prefill.hospital.name]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
                      <dt className="text-ink-500">{k}</dt>
                      <dd className="whitespace-pre-line text-ink-900">{v}</dd>
                    </div>
                  ))}
                </dl>
                {!user && (
                  <div className="rounded-2xl bg-ink-50 p-5">
                    <p className="font-semibold text-ink-900">Create your free account</p>
                    <p className="mt-0.5 text-sm text-ink-500">
                      Your case room needs an account so only you can see it. Already registered?{" "}
                      <Link href={`/login?next=${encodeURIComponent(second ? "/second-opinion" : "/get-quote")}`} className="font-semibold text-brand-700 hover:underline">
                        Log in
                      </Link>{" "}
                      — your answers are saved.
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Input aria-label="Your name" placeholder="Your name" value={form.account.name} onChange={(e) => set("account", { ...form.account, name: e.target.value })} autoComplete="name" />
                      <Input aria-label="Email" type="email" placeholder="Email" value={form.account.email} onChange={(e) => set("account", { ...form.account, email: e.target.value })} autoComplete="email" />
                      <Input aria-label="Password" type="password" placeholder="Password (8+)" value={form.account.password} onChange={(e) => set("account", { ...form.account, password: e.target.value })} autoComplete="new-password" />
                    </div>
                  </div>
                )}
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4">
                  <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 h-4 w-4 accent-brand-700" />
                  <span className="text-sm text-ink-700">
                    I consent to Whole Care sharing this information and my reports with the hospitals and specialists I choose, so they can review my case. I understand Whole Care doesn&rsquo;t provide medical advice. <Link href="/legal/privacy" className="underline">Privacy policy</Link>
                  </span>
                </label>
                <p className="flex items-center gap-2 text-xs text-ink-500">
                  <ShieldCheck size={14} aria-hidden /> Free for patients. No commitment until you accept a quote.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 space-y-3">
          <FormError>{error}</FormError>
          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>
                <ChevronLeft size={16} aria-hidden /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < steps.length - 1 ? (
              <Button onClick={next} size="lg">
                Continue
              </Button>
            ) : (
              <Button onClick={submit} size="lg" disabled={busy}>
                {busy ? progress || "Sending…" : second ? "Request second opinion" : "Create my case"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink-400">
        <Stethoscope size={13} aria-hidden /> In an emergency, contact local emergency services — Whole Care is not for urgent care.
      </p>
    </div>
  );
}
