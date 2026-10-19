"use client";
import { useState } from "react";
import Link from "next/link";
import { ReceiptText, LockKeyhole, BadgeCheck, CalendarClock, Check, X, Stethoscope, BedDouble, Award, Hourglass } from "lucide-react";
import { Badge, Button, EmptyState, RatingPill, Textarea, formatDate, cn } from "@/components/ui/core";
import { Modal, Price, api, useToast } from "@/components/ui/client";

const STATUS = {
  submitted: ["Awaiting your decision", "brand"],
  accepted: ["Accepted · price locked", "success"],
  declined: ["Declined", "neutral"],
  not_selected: ["Not selected", "neutral"],
  superseded: ["Replaced by a newer quote", "neutral"],
  withdrawn: ["Withdrawn by hospital", "neutral"],
  expired: ["Expired", "danger"],
};

function daysLeft(q) {
  const end = Date.parse(q.createdAt) + q.validityDays * 864e5;
  return { end: new Date(end), days: Math.ceil((end - Date.now()) / 864e5) };
}

export default function QuotesTab({ data, onChange, canDecide }) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [agree, setAgree] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const { case: c, quotations, hospitals } = data;
  const visible = quotations.filter((q) => q.status !== "superseded");
  const open = visible.filter((q) => q.status === "submitted");
  const lowest = open.length > 1 ? open.reduce((a, b) => (b.totalUSD < a.totalUSD ? b : a)).id : null;

  async function decide(q, action) {
    setBusy(true);
    try {
      await api(`/api/quotations/${q.id}`, { method: "PATCH", body: { action, reason } });
      toast(action === "accept" ? "Quote accepted — your price is locked." : "Quote declined.");
      setAccepting(null);
      setDeclining(null);
      setAgree(false);
      setReason("");
      onChange();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (!visible.length) {
    return (
      <EmptyState icon={ReceiptText} title={c.sentToHospitals.length ? "Waiting for quotes" : "No quotes yet"} action={!c.sentToHospitals.length ? <Button href="?tab=overview">Choose hospitals</Button> : null}>
        {c.sentToHospitals.length ? `${c.sentToHospitals.length} hospital${c.sentToHospitals.length > 1 ? "s are" : " is"} reviewing your case. Itemized quotes appear here — usually within a few days.` : "Send your case to hospitals from the Overview tab to receive itemized quotes."}
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      {c.acceptedQuoteId && (
        <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-brand-700 to-ink-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <LockKeyhole size={22} aria-hidden />
            </span>
            <div>
              <p className="font-display text-xl font-bold">Price locked</p>
              <p className="text-sm text-brand-100">Your accepted quote&rsquo;s exact terms are recorded on a certificate both you and the hospital can see.</p>
            </div>
          </div>
          <Link href={`/quote/${c.acceptedQuoteId}`} className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-brand-50">
            View certificate
          </Link>
        </div>
      )}
      <div className={cn("grid gap-4", visible.length > 1 ? "lg:grid-cols-2" : "")}>
        {visible.map((q) => {
          const h = hospitals[q.hospitalId];
          const { end, days } = daysLeft(q);
          const [label, tone] = STATUS[q.status] || ["", "neutral"];
          const isOpen = q.status === "submitted";
          return (
            <article key={q.id} className={cn("card flex flex-col overflow-hidden", q.status === "accepted" && "ring-2 ring-brand-500", !isOpen && q.status !== "accepted" && "opacity-75")}>
              <div className="flex items-start justify-between gap-3 border-b border-line p-5">
                <div>
                  <Link href={`/hospitals/${h?.slug}`} className="font-display text-lg font-bold text-ink-900 hover:text-brand-700">
                    {h?.name}
                  </Link>
                  <p className="text-sm text-ink-500">
                    {h?.city}, {h?.country} · {h?.accreditations?.join(" · ")}
                  </p>
                  <div className="mt-1.5">
                    <RatingPill rating={h?.rating} count={h?.reviewCount} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={tone}>{label}</Badge>
                  {q.id === lowest && (
                    <Badge tone="sun" icon={Award}>
                      Lowest total
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-semibold text-ink-900">{q.procedure}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                  {q.doctorName && (
                    <span className="inline-flex items-center gap-1">
                      <Stethoscope size={13} aria-hidden /> {q.doctorName}
                    </span>
                  )}
                  {q.hospitalStayDays > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <BedDouble size={13} aria-hidden /> {q.hospitalStayDays} nights in hospital
                    </span>
                  )}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  {(q.lineItems || []).map((l) => (
                    <div key={l.label} className="flex justify-between gap-4">
                      <dt className="text-ink-600">{l.label}</dt>
                      <dd className="shrink-0 font-medium tabular-nums text-ink-900">${l.amountUSD.toLocaleString("en-US")}</dd>
                    </div>
                  ))}
                  <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
                    <dt className="font-semibold text-ink-900">Total</dt>
                    <dd className="text-right">
                      <span className="font-display text-2xl font-bold text-ink-900">${q.totalUSD?.toLocaleString("en-US")}</span>
                      <span className="block text-xs text-ink-400">
                        ≈ <Price usd={q.totalUSD} /> in your currency
                      </span>
                    </dd>
                  </div>
                </dl>
                {q.inclusions?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {q.inclusions.map((i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-ok-50 px-2.5 py-1 text-xs font-medium text-ok-700">
                        <Check size={12} aria-hidden /> {i}
                      </span>
                    ))}
                  </div>
                )}
                {q.exclusions && <p className="mt-3 text-xs text-ink-500">Not included: {q.exclusions}</p>}
                {q.notes && <p className="mt-3 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">{q.notes}</p>}
                <div className="mt-auto pt-5">
                  <p className={cn("mb-3 flex items-center gap-1.5 text-xs", isOpen && days <= 5 ? "font-semibold text-coral-700" : "text-ink-500")}>
                    {isOpen ? <Hourglass size={13} aria-hidden /> : <CalendarClock size={13} aria-hidden />}
                    {q.status === "accepted" ? `Locked until ${formatDate(q.lockedUntil)} · ${q.lockCode}` : isOpen ? (days > 0 ? `Valid until ${formatDate(end)} (${days} day${days === 1 ? "" : "s"} left)` : "Expired") : `Issued ${formatDate(q.createdAt)}`}
                  </p>
                  {isOpen && canDecide && !c.acceptedQuoteId && days > 0 && (
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => setAccepting(q)}>
                        <LockKeyhole size={16} aria-hidden /> Accept & lock price
                      </Button>
                      <Button variant="outline" onClick={() => setDeclining(q)} aria-label="Decline quote">
                        <X size={16} aria-hidden />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal open={Boolean(accepting)} onClose={() => setAccepting(null)} title="Accept and lock this quote">
        {accepting && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-ink-50 p-4">
              <p className="text-sm text-ink-500">{hospitals[accepting.hospitalId]?.name}</p>
              <p className="font-semibold text-ink-900">{accepting.procedure}</p>
              <p className="mt-2 font-display text-3xl font-bold text-ink-900">${accepting.totalUSD.toLocaleString("en-US")}</p>
            </div>
            <ul className="space-y-2 text-sm text-ink-600">
              <li className="flex gap-2">
                <BadgeCheck size={17} className="shrink-0 text-brand-600" aria-hidden /> The quote&rsquo;s line items, inclusions, exclusions and validity are recorded on a price-lock certificate.
              </li>
              <li className="flex gap-2">
                <BadgeCheck size={17} className="shrink-0 text-brand-600" aria-hidden /> Other open quotes are closed, and the hospital can issue your visa invitation letter.
              </li>
              <li className="flex gap-2">
                <BadgeCheck size={17} className="shrink-0 text-brand-600" aria-hidden /> If new findings on admission change the plan, the hospital must issue a new quote you can review.
              </li>
            </ul>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 text-sm text-ink-700">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-700" />I understand the certificate documents the hospital&rsquo;s quoted terms; it is not insurance, and payment is made to the hospital under its terms.
            </label>
            <Button className="w-full" size="lg" disabled={!agree || busy} onClick={() => decide(accepting, "accept")}>
              {busy ? "Locking…" : "Accept & lock price"}
            </Button>
          </div>
        )}
      </Modal>
      <Modal open={Boolean(declining)} onClose={() => setDeclining(null)} title="Decline this quote">
        {declining && (
          <div className="space-y-4">
            <p className="text-sm text-ink-600">Let {hospitals[declining.hospitalId]?.name} know why (optional) — it helps them improve.</p>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Chose a hospital closer to home" aria-label="Reason" />
            <Button variant="dark" className="w-full" disabled={busy} onClick={() => decide(declining, "decline")}>
              Decline quote
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
