"use client";
import { FileCheck2, Clock, Stethoscope, Printer } from "lucide-react";
import { Avatar, Badge, formatDate, buttonClass } from "@/components/ui/core";

export default function OpinionTab({ data }) {
  const c = data.case;
  const so = c.secondOpinion || {};
  const doctor = data.doctor;
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {doctor ? <Avatar name={doctor.name} src={doctor.image} size={56} /> : <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink-50 text-ink-400"><Stethoscope size={24} aria-hidden /></span>}
            <div>
              <p className="font-bold text-ink-900">{doctor ? doctor.name : "Specialist being assigned"}</p>
              <p className="text-sm text-ink-500">{doctor ? `${doctor.specialty} · ${doctor.title}` : `Your coordinator is matching you with a ${c.specialty || "specialist"}.`}</p>
            </div>
          </div>
          <Badge tone={so.status === "delivered" ? "success" : "sun"} icon={so.status === "delivered" ? FileCheck2 : Clock}>
            {so.status === "delivered" ? `Delivered ${formatDate(so.deliveredAt)}` : so.dueBy ? `Expected by ${formatDate(so.dueBy)}` : "In review"}
          </Badge>
        </div>
        <div className="mt-6 rounded-2xl bg-ink-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Your questions</p>
          <p className="mt-2 whitespace-pre-line text-ink-700">{c.questions}</p>
        </div>
      </section>
      {so.status === "delivered" ? (
        <section className="card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-xl font-bold text-ink-900">Written opinion</p>
            <button onClick={() => window.print()} className={buttonClass({ variant: "outline", size: "sm" })}>
              <Printer size={15} aria-hidden /> Print
            </button>
          </div>
          <div className="mt-5 whitespace-pre-line text-[16px] leading-relaxed text-ink-700">{so.summary}</div>
          {so.recommendations && (
            <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
              <p className="text-sm font-semibold text-brand-800">Options the specialist would consider</p>
              <p className="mt-2 whitespace-pre-line text-ink-700">{so.recommendations}</p>
            </div>
          )}
          <p className="mt-6 text-xs text-ink-400">Signed by {so.deliveredBy}. This opinion is based on the records provided and does not replace an examination by your treating doctor.</p>
        </section>
      ) : (
        <section className="card flex items-center gap-4 p-6 text-sm text-ink-600">
          <Clock size={20} className="shrink-0 text-sun-700" aria-hidden />
          The specialist reviews your reports and questions. Upload anything else that might help in the Documents tab — you&rsquo;ll be notified when the opinion is ready.
        </section>
      )}
    </div>
  );
}
