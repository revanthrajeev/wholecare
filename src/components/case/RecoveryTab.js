"use client";
import { useState } from "react";
import { HeartPulse, AlertTriangle, CheckCircle2, Circle, CalendarDays, Plus } from "lucide-react";
import { Button, Input, Textarea, EmptyState, formatDate, cn } from "@/components/ui/core";
import RecoveryChart from "@/components/case/RecoveryChart";

function Slider({ label, value, onChange, low, high, id }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink-700">
          {label}
        </label>
        <span className="font-display text-2xl font-bold tabular-nums text-ink-900">{value}</span>
      </div>
      <input id={id} type="range" min="0" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-brand-700" />
      <div className="flex justify-between text-[11px] text-ink-400">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export default function RecoveryTab({ data, act, busy, role = "patient" }) {
  const c = data.case;
  const plan = c.recovery?.plan || [];
  const checkins = c.recovery?.checkins || [];
  const [pain, setPain] = useState(checkins.at(-1)?.pain ?? 5);
  const [mobility, setMobility] = useState(checkins.at(-1)?.mobility ?? 5);
  const [note, setNote] = useState("");
  const [task, setTask] = useState({ title: "", due: "" });
  const active = ["In Treatment", "Recovery", "Completed"].includes(c.stage) || plan.length || checkins.length;
  const today = new Date().toISOString().slice(0, 10);
  const doneCount = plan.filter((t) => t.done).length;

  if (!active)
    return (
      <EmptyState icon={HeartPulse} title="Your recovery plan starts after treatment">
        When your hospital marks you as discharged, a recovery plan with follow-ups appears here — and you can log how you&rsquo;re feeling for your surgeon to see.
      </EmptyState>
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold text-ink-900">How recovery is going</p>
            <span className="text-xs text-ink-400">{checkins.length} check-ins</span>
          </div>
          <div className="mt-4">
            <RecoveryChart checkins={checkins} />
          </div>
        </section>
        {role === "patient" ? (
          <section className="card space-y-5 p-6">
            <p className="font-bold text-ink-900">Today&rsquo;s check-in</p>
            <Slider id="pain" label="Pain" value={pain} onChange={setPain} low="No pain" high="Worst" />
            <Slider id="mobility" label="Mobility" value={mobility} onChange={setMobility} low="Can't move" high="Normal" />
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything to note? (optional)" aria-label="Note" />
            <Button className="w-full" disabled={busy} onClick={async () => (await act("checkin", { pain, mobility, note, date: today }, "Check-in saved")) && setNote("")}>
              Save check-in
            </Button>
            {pain >= 8 && <p className="rounded-xl bg-coral-50 p-3 text-xs font-medium text-coral-700">A high pain score notifies your hospital team. If pain is sudden or severe, seek local medical care now.</p>}
          </section>
        ) : (
          <section className="card p-6">
            <p className="font-bold text-ink-900">Latest check-in</p>
            {checkins.at(-1) ? (
              <p className="mt-3 text-sm text-ink-600">
                {formatDate(checkins.at(-1).date)} — pain {checkins.at(-1).pain}/10, mobility {checkins.at(-1).mobility}/10
                {checkins.at(-1).note ? ` · “${checkins.at(-1).note}”` : ""}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink-400">No check-ins yet.</p>
            )}
          </section>
        )}
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink-900">Recovery plan</p>
          {plan.length > 0 && (
            <span className="text-sm text-ink-500">
              {doneCount} of {plan.length} done
            </span>
          )}
        </div>
        {plan.length > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(doneCount / plan.length) * 100}%` }} />
          </div>
        )}
        <ul className="mt-4 space-y-2">
          {plan.map((t) => {
            const overdue = !t.done && t.due && t.due < today;
            return (
              <li key={t.id}>
                <button
                  disabled={busy}
                  onClick={() => act("task", { taskId: t.id, done: !t.done })}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition", t.done ? "border-transparent bg-ok-50" : "border-line bg-white hover:border-ink-300")}
                  aria-pressed={t.done}
                >
                  {t.done ? <CheckCircle2 size={20} className="shrink-0 text-ok-600" aria-hidden /> : <Circle size={20} className="shrink-0 text-ink-300" aria-hidden />}
                  <span className={cn("flex-1 text-sm", t.done ? "text-ink-500 line-through" : "font-medium text-ink-900")}>{t.title}</span>
                  {t.due && (
                    <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "font-semibold text-coral-700" : "text-ink-400")}>
                      <CalendarDays size={12} aria-hidden /> {overdue ? "Overdue · " : ""}
                      {formatDate(t.due, { day: "numeric", month: "short" })}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {plan.length === 0 && <p className="text-sm text-ink-400">Your hospital will add follow-up tasks here.</p>}
        </ul>
        {role !== "patient" && (
          <div className="mt-5 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row">
            <Input aria-label="New task" placeholder="Add a follow-up task, e.g. 3-month X-ray review" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
            <Input aria-label="Due date" type="date" value={task.due} onChange={(e) => setTask({ ...task, due: e.target.value })} className="sm:w-48" />
            <Button disabled={busy || !task.title.trim()} onClick={async () => (await act("task", { add: task }, "Task added")) && setTask({ title: "", due: "" })}>
              <Plus size={16} aria-hidden /> Add
            </Button>
          </div>
        )}
      </section>

      <section className="flex gap-4 rounded-3xl border border-sun-100 bg-sun-50 p-6">
        <AlertTriangle size={22} className="mt-0.5 shrink-0 text-sun-700" aria-hidden />
        <div>
          <p className="font-bold text-sun-700">When to get help straight away</p>
          <p className="mt-1 text-sm text-ink-700">Calf pain or swelling, sudden breathlessness, chest pain, fever, or a wound that is hot, red or leaking need prompt medical attention — locally, without waiting for a scheduled follow-up. Then tell your hospital team here.</p>
        </div>
      </section>
    </div>
  );
}
