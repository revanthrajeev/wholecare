"use client";
import { useState } from "react";
import Link from "next/link";
import { Video, Sparkles, CalendarPlus } from "lucide-react";
import { Badge, Button, Textarea, EmptyState, formatDate, buttonClass } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";

const TONE = { requested: "sun", confirmed: "success", completed: "neutral", declined: "danger", cancelled: "neutral" };

export default function ConsultsTab({ data, onChange }) {
  const { toast } = useToast();
  const c = data.case;
  const [text, setText] = useState(c.questionList?.raw || "");
  const [busy, setBusy] = useState(false);
  const list = c.questionList;

  async function organise() {
    setBusy(true);
    try {
      await api("/api/ai/organize-questions", { method: "POST", body: { caseId: c.id, text } });
      toast("Questions organised and saved to your case");
      onChange();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink-900">Video consultations</p>
          <Link href="/consult" className={buttonClass({ size: "sm" })}>
            <Video size={15} aria-hidden /> Book
          </Link>
        </div>
        {data.consultations.length === 0 ? (
          <EmptyState icon={Video} title="No consultations yet">
            Talk to a specialist before you decide — link the booking to this case so they can see your reports.
          </EmptyState>
        ) : (
          data.consultations.map((x) => (
            <div key={x.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{x.doctorName}</p>
                  <p className="text-sm text-ink-500">
                    {x.specialty} · {x.hospitalName}
                  </p>
                </div>
                <Badge tone={TONE[x.status]}>{x.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-ink-700">
                {formatDate(x.date, { weekday: "short", day: "numeric", month: "short" })} · {x.timeSlot} <span className="text-ink-400">({x.timezone})</span>
              </p>
              {x.doctorNotes && <p className="mt-3 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">{x.doctorNotes}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/consultations/${x.id}`} className={buttonClass({ size: "sm", variant: x.status === "confirmed" ? "primary" : "outline" })}>
                  {x.status === "confirmed" ? "Join room" : "Details"}
                </Link>
                {["requested", "confirmed"].includes(x.status) && (
                  <a href={`/api/consultations/${x.id}/ics`} className={buttonClass({ size: "sm", variant: "ghost" })}>
                    <CalendarPlus size={14} aria-hidden /> Calendar
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </section>
      <section className="card p-6">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <Sparkles size={18} className="text-brand-600" aria-hidden /> Prepare your questions
        </p>
        <p className="mt-1 text-sm text-ink-500">Write your worries in your own words. They&rsquo;re organised into clear questions for the doctor — the assistant never answers them itself.</p>
        <Textarea rows={4} className="mt-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. how long in hospital, is it safe at my age, when can I fly home, what if I need more physio at home…" aria-label="Your questions" />
        <Button className="mt-3" disabled={busy || text.trim().length < 5} onClick={organise}>
          {busy ? "Organising…" : list ? "Re-organise" : "Organise my questions"}
        </Button>
        {list?.categories?.length > 0 && (
          <div className="mt-5 space-y-3">
            {list.categories.map((cat) => (
              <div key={cat.name} className="rounded-2xl border border-line p-4">
                <p className="text-sm font-semibold text-brand-800">{cat.name}</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-700">
                  {cat.questions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-ink-400">Saved to your case · {list.provider === "claude" ? "organised by Claude" : list.provider === "ollama" ? "organised by a local model" : "organised automatically"} · shared with hospitals on your case</p>
          </div>
        )}
      </section>
    </div>
  );
}
