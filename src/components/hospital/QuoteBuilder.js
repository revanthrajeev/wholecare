"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, LockKeyhole, Info, Check } from "lucide-react";
import { Button, Field, Input, Select, Textarea, FormError, Badge, formatDate, cn } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";
import { treatmentBySlug } from "@/content/treatments";

const TEMPLATE = ["Surgeon & anaesthesia fees", "Hospital stay", "Implant / device", "Operating theatre & consumables", "Pre-operative tests", "Medicines during admission"];
const INCLUSIONS = ["Airport pickup", "Interpreter", "Visa invitation letter", "Hotel nights after discharge", "Inpatient physiotherapy", "Follow-up video consults"];

export default function QuoteBuilder({ data, onSubmitted, hospitalCountry }) {
  const { toast } = useToast();
  const c = data.case;
  const t = treatmentBySlug(c.treatmentSlug);
  const stay = Number(String(t?.hospitalStay || "").match(/\d+/)?.[0]) || 0;
  const [form, setForm] = useState({ procedure: t?.name || c.specialty || "", doctorId: data.doctors?.find((d) => d.specialty === c.specialty)?.id || "", hospitalStayDays: stay, exclusions: (t?.excludes || []).join(", "), validityDays: 21, notes: "" });
  const [items, setItems] = useState(TEMPLATE.slice(0, 4).map((label) => ({ label, amountUSD: "" })));
  const [inclusions, setInclusions] = useState(["Airport pickup", "Interpreter"]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const total = useMemo(() => items.reduce((s, l) => s + (Number(l.amountUSD) || 0), 0), [items]);
  const range = t?.prices?.[hospitalCountry];
  const mine = data.quotations;
  const accepted = mine.find((q) => q.status === "accepted");
  const closed = c.acceptedQuoteId && !accepted;

  async function submit() {
    setError("");
    const lineItems = items.filter((l) => l.label.trim() && Number(l.amountUSD) > 0).map((l) => ({ label: l.label.trim(), amountUSD: Math.round(Number(l.amountUSD)) }));
    if (!lineItems.length) return setError("Add at least one line item with an amount.");
    setBusy(true);
    try {
      await api("/api/quotations", { method: "POST", body: { caseId: c.id, ...form, lineItems, inclusions } });
      toast("Quotation sent — the patient has been notified.");
      onSubmitted();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (accepted)
    return (
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-brand-700 to-ink-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <LockKeyhole size={22} aria-hidden />
            <div>
              <p className="font-display text-xl font-bold">Quote accepted — ${accepted.totalUSD.toLocaleString("en-US")}</p>
              <p className="text-sm text-brand-100">
                {accepted.lockCode} · locked until {formatDate(accepted.lockedUntil)}
              </p>
            </div>
          </div>
          <Link href={`/quote/${accepted.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900">
            Certificate
          </Link>
        </div>
        <p className="p-5 text-sm text-ink-600">Any change to the agreed terms needs a new quote the patient can review. Message the patient first if findings on admission change the plan.</p>
      </div>
    );

  return (
    <div className="space-y-5">
      {closed && <p className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600">The patient accepted another hospital&rsquo;s quote. This case is closed for quoting.</p>}
      {mine.length > 0 && (
        <div className="card divide-y divide-line">
          {mine.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <span>
                <span className="font-semibold text-ink-900">${q.totalUSD.toLocaleString("en-US")}</span> · {q.procedure} · {formatDate(q.createdAt)}
              </span>
              <Badge tone={q.status === "submitted" ? "brand" : "neutral"}>{q.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </div>
      )}
      {!closed && (
        <section className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink-900">{mine.some((q) => q.status === "submitted") ? "Send a revised quote" : "Build a quote"}</p>
              <p className="text-sm text-ink-500">Itemized quotes convert better — patients compare line by line.</p>
            </div>
            {range && (
              <p className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-xs text-ink-600">
                <Info size={13} aria-hidden /> Market range in {hospitalCountry}: ${range[0].toLocaleString("en-US")}–{range[1].toLocaleString("en-US")}
              </p>
            )}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Procedure" htmlFor="q-proc">
              <Input id="q-proc" value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} />
            </Field>
            <Field label="Treating doctor" htmlFor="q-doc">
              <Select id="q-doc" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">To be assigned</option>
                {(data.doctors || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialty}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ink-700">Line items (USD)</p>
            <div className="space-y-2">
              {items.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <Input aria-label={`Item ${i + 1}`} value={l.label} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Description" />
                  <Input aria-label={`Amount ${i + 1}`} type="number" min="0" inputMode="numeric" value={l.amountUSD} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, amountUSD: e.target.value } : x)))} placeholder="0" className="w-36 text-right tabular-nums" />
                  <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Remove line" className="rounded-xl px-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setItems([...items, { label: "", amountUSD: "" }])} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-600 hover:border-ink-300">
                  <Plus size={13} aria-hidden /> Add line
                </button>
                {TEMPLATE.filter((x) => !items.some((l) => l.label === x)).map((x) => (
                  <button key={x} type="button" onClick={() => setItems([...items, { label: x, amountUSD: "" }])} className="rounded-full bg-ink-50 px-3 py-1.5 text-xs text-ink-600 hover:bg-ink-100">
                    + {x}
                  </button>
                ))}
              </div>
              <p className="text-sm">
                Total <span className="font-display text-2xl font-bold tabular-nums text-ink-900">${total.toLocaleString("en-US")}</span>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-ink-700">Included at no extra cost</p>
            <div className="flex flex-wrap gap-2">
              {INCLUSIONS.map((x) => {
                const on = inclusions.includes(x);
                return (
                  <button key={x} type="button" onClick={() => setInclusions(on ? inclusions.filter((y) => y !== x) : [...inclusions, x])} aria-pressed={on} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition", on ? "bg-ok-50 font-medium text-ok-700 ring-1 ring-[#bfe5cb]" : "bg-white text-ink-600 ring-1 ring-line hover:text-ink-900")}>
                    {on && <Check size={13} aria-hidden />} {x}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px_160px]">
            <Field label="Not included" htmlFor="q-excl">
              <Input id="q-excl" value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} placeholder="Flights, hotel, post-discharge medication…" />
            </Field>
            <Field label="Hospital nights" htmlFor="q-stay">
              <Input id="q-stay" type="number" min="0" value={form.hospitalStayDays} onChange={(e) => setForm({ ...form, hospitalStayDays: e.target.value })} />
            </Field>
            <Field label="Valid for" htmlFor="q-valid">
              <Select id="q-valid" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}>
                {[14, 21, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Note to the patient" htmlFor="q-notes" optional className="mt-4">
            <Textarea id="q-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Assumptions, what could change the plan, what you need before admission…" />
          </Field>
          <FormError>{error}</FormError>
          <div className="mt-5 flex justify-end">
            <Button size="lg" disabled={busy || !total} onClick={submit}>
              {busy ? "Sending…" : `Send quote · $${total.toLocaleString("en-US")}`}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
