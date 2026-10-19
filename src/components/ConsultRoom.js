"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, ExternalLink, CheckCircle2, XCircle, CalendarPlus, Mic, Camera, Wifi } from "lucide-react";
import { Button, Badge, Textarea, buttonClass, formatDate } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";
import { zonedToUtc } from "@/lib/schedule";
import { useIsClient } from "@/lib/useIsClient";

const STATUS_TONE = { requested: "sun", confirmed: "success", completed: "neutral", declined: "danger", cancelled: "neutral" };

export default function ConsultRoom({ consultation: c, viewer, displayName }) {
  const router = useRouter();
  const { toast } = useToast();
  const [joined, setJoined] = useState(false);
  const [notes, setNotes] = useState(c.doctorNotes || "");
  const [busy, setBusy] = useState(false);
  const isHospital = viewer === "hospital" || viewer === "staff";
  const start = zonedToUtc(c.date, c.timeSlot, c.timeZone);
  // The viewer's own zone and date style are only known in the browser, so this fills in after hydration.
  const isClient = useIsClient();
  const yourTime = isClient ? start.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "…";
  const videoBase = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL || "https://meet.jit.si").replace(/\/$/, "");
  const roomUrl = `${videoBase}/${c.roomId}#userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}&config.prejoinConfig.enabled=true`;

  async function act(action) {
    setBusy(true);
    try {
      await api(`/api/consultations/${c.id}`, { method: "PATCH", body: { action, notes } });
      toast(action === "confirm" ? "Consultation confirmed — the patient has been notified." : action === "complete" ? "Marked complete." : action === "cancel" ? "Consultation cancelled." : "Updated.");
      router.refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-[28px] border border-line bg-ink-950 shadow-lift">
        {c.status === "confirmed" && joined ? (
          <iframe title="Video consultation" src={roomUrl} allow="camera; microphone; fullscreen; display-capture; autoplay" className="aspect-video w-full min-h-[420px] bg-ink-950" />
        ) : (
          <div className="flex aspect-video min-h-[420px] flex-col items-center justify-center p-8 text-center text-white">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-glow">
              <Video size={30} aria-hidden />
            </span>
            {c.status === "confirmed" ? (
              <>
                <p className="mt-5 font-display text-2xl font-bold">Ready when you are</p>
                <p className="mt-2 max-w-md text-sm text-ink-300">Joining opens a secure browser video room. You&rsquo;ll be asked for camera and microphone access.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-ink-300">
                  <span className="inline-flex items-center gap-1.5"><Camera size={14} aria-hidden /> Camera</span>
                  <span className="inline-flex items-center gap-1.5"><Mic size={14} aria-hidden /> Microphone</span>
                  <span className="inline-flex items-center gap-1.5"><Wifi size={14} aria-hidden /> Stable connection</span>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button variant="accent" size="lg" onClick={() => setJoined(true)}>
                    Join video call
                  </Button>
                  <a href={roomUrl} target="_blank" rel="noopener noreferrer" className={buttonClass({ variant: "ghostDark", size: "lg" })}>
                    Open in new tab <ExternalLink size={16} aria-hidden />
                  </a>
                </div>
              </>
            ) : c.status === "requested" ? (
              <>
                <p className="mt-5 font-display text-2xl font-bold">Waiting for the hospital to confirm</p>
                <p className="mt-2 max-w-md text-sm text-ink-300">The video room unlocks once {c.hospitalName} confirms this slot. You&rsquo;ll get a notification.</p>
              </>
            ) : (
              <>
                <p className="mt-5 font-display text-2xl font-bold">This consultation is {c.status}</p>
                {c.doctorNotes && <p className="mt-3 max-w-lg rounded-2xl bg-white/5 p-4 text-left text-sm text-ink-200">{c.doctorNotes}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-ink-900">{c.doctorName}</p>
            <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
          </div>
          <p className="text-sm text-ink-500">
            {c.specialty} · {c.hospitalName}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Hospital time</dt>
              <dd className="text-right font-semibold text-ink-900">
                {formatDate(c.date, { weekday: "short", day: "numeric", month: "short" })} · {c.timeSlot}
                <span className="block text-xs font-normal text-ink-400">{c.timezone}</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Your time</dt>
              <dd className="text-right font-semibold text-ink-900">{yourTime}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Fee</dt>
              <dd className="font-semibold text-ink-900">${c.feeUSD}</dd>
            </div>
          </dl>
          {c.reason && <p className="mt-4 rounded-xl bg-ink-50 p-3 text-sm text-ink-600">&ldquo;{c.reason}&rdquo;</p>}
          <a href={`/api/consultations/${c.id}/ics`} className={buttonClass({ variant: "outline", size: "sm", className: "mt-4 w-full" })}>
            <CalendarPlus size={15} aria-hidden /> Add to calendar
          </a>
        </div>

        {isHospital && (
          <div className="card space-y-3 p-5">
            <p className="font-bold text-ink-900">Clinician actions</p>
            {c.status === "requested" && (
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" disabled={busy} onClick={() => act("confirm")}>
                  <CheckCircle2 size={15} aria-hidden /> Confirm
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => act("decline")}>
                  <XCircle size={15} aria-hidden /> Decline
                </Button>
              </div>
            )}
            {c.status === "confirmed" && (
              <>
                <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Consultation summary for the patient (shared with them)" aria-label="Consultation notes" />
                <Button size="sm" disabled={busy} onClick={() => act("complete")} className="w-full">
                  Mark complete & share notes
                </Button>
              </>
            )}
          </div>
        )}
        {viewer === "patient" && ["requested", "confirmed"].includes(c.status) && (
          <button onClick={() => act("cancel")} disabled={busy} className="w-full text-center text-sm font-semibold text-rose-600 hover:underline">
            Cancel this consultation
          </button>
        )}
        <p className="text-xs leading-relaxed text-ink-400">Video runs on Jitsi Meet (the public server limits embedded calls — use “Open in new tab” for longer calls). For real patient calls, point NEXT_PUBLIC_VIDEO_BASE_URL at a self-hosted or contracted video service.</p>
      </aside>
    </div>
  );
}
