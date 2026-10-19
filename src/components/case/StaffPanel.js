"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button, Select, Textarea, formatDateTime } from "@/components/ui/core";
import { HOSPITAL_UPDATES } from "@/lib/constants";

export default function StaffPanel({ data, act, busy }) {
  const c = data.case;
  const [note, setNote] = useState("");
  return (
    <section className="card space-y-4 border-sun-100 p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <ShieldCheck size={16} className="text-sun-700" aria-hidden /> Coordinator controls
      </p>
      <label className="block text-xs font-semibold text-ink-500">
        Coordinator
        <Select className="mt-1 h-10 py-0 text-sm" value={c.coordinatorId || ""} onChange={(e) => e.target.value && act("assignCoordinator", { coordinatorId: e.target.value }, "Coordinator assigned")} disabled={busy}>
          <option value="">Unassigned</option>
          {(data.staff || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.role})
            </option>
          ))}
        </Select>
      </label>
      <label className="block text-xs font-semibold text-ink-500">
        Stage
        <Select className="mt-1 h-10 py-0 text-sm" value={c.stage} onChange={(e) => act("stage", { stage: e.target.value }, "Stage updated")} disabled={busy}>
          {data.stages.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </label>
      {c.type === "second_opinion" && (
        <label className="block text-xs font-semibold text-ink-500">
          Specialist
          <Select className="mt-1 h-10 py-0 text-sm" value={c.secondOpinion?.doctorId || ""} onChange={(e) => e.target.value && act("assignSpecialist", { doctorId: e.target.value }, "Specialist assigned")} disabled={busy}>
            <option value="">Choose…</option>
            {(data.specialists || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.specialty}
              </option>
            ))}
          </Select>
        </label>
      )}
      {c.acceptedQuoteId && (
        <div>
          <p className="text-xs font-semibold text-ink-500">Post a milestone</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {HOSPITAL_UPDATES.map((u) => (
              <Button key={u.id} size="xs" variant="outline" disabled={busy} onClick={() => act("milestone", { update: u.id }, "Milestone posted")}>
                {u.label}
              </Button>
            ))}
            <Button size="xs" variant="outline" disabled={busy} onClick={() => act("complete", {}, "Case completed")}>
              Complete case
            </Button>
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-semibold text-ink-500">Internal notes (staff only)</p>
        <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
          {(c.staffNotes || []).map((n) => (
            <li key={n.id} className="rounded-xl bg-sun-50 p-2.5 text-xs text-ink-700">
              {n.text}
              <span className="mt-1 block text-[10px] text-ink-400">
                {n.by} · {formatDateTime(n.at)}
              </span>
            </li>
          ))}
        </ul>
        <Textarea rows={2} className="mt-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" aria-label="Internal note" />
        <Button size="xs" className="mt-2" disabled={busy || !note.trim()} onClick={async () => (await act("note", { text: note }, "Note saved")) && setNote("")}>
          Save note
        </Button>
      </div>
    </section>
  );
}
