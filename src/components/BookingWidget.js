"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CalendarPlus, Clock, Video, CheckCircle2 } from "lucide-react";
import { Button, Select, Textarea, FormError, buttonClass, cn, formatDate } from "@/components/ui/core";
import { Price, api } from "@/components/ui/client";
import { zonedToUtc } from "@/lib/schedule";

function localTime(date, time, timeZone) {
  try {
    return zonedToUtc(date, time, timeZone).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

export default function BookingWidget({ doctor, user, compact }) {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState({ slug: null, grid: null });
  const grid = loaded.slug === doctor.slug ? loaded.grid : null;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [caseId, setCaseId] = useState("");
  const [cases, setCases] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    let alive = true;
    api(`/api/doctors/${doctor.slug}/slots`)
      .then((g) => {
        if (!alive) return;
        setLoaded({ slug: doctor.slug, grid: g });
        setDate(g.days.find((d) => d.slots.some((s) => s.available))?.date || "");
        setTime("");
      })
      .catch(() => alive && setLoaded({ slug: doctor.slug, grid: { days: [] } }));
    return () => {
      alive = false;
    };
  }, [doctor.slug]);

  useEffect(() => {
    if (user?.role === "patient") api("/api/cases").then((c) => setCases(Array.isArray(c) ? c : [])).catch(() => {});
  }, [user]);

  const day = useMemo(() => grid?.days.find((d) => d.date === date), [grid, date]);
  const yourZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  async function book() {
    setError("");
    setBusy(true);
    try {
      const c = await api("/api/consultations", { method: "POST", body: { doctorId: doctor.id, date, timeSlot: time, reason, caseId: caseId || undefined } });
      setDone(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-50 text-ok-700">
          <CheckCircle2 size={28} aria-hidden />
        </span>
        <p className="mt-4 font-display text-xl font-bold text-ink-900">Consultation requested</p>
        <p className="mt-2 text-sm text-ink-600">
          {doctor.name} · {formatDate(done.date, { weekday: "long", day: "numeric", month: "long" })} at {done.timeSlot} ({grid?.timezone})
        </p>
        <p className="mt-2 text-xs text-ink-500">The hospital confirms your slot — usually within a day. Your video link appears in your dashboard as soon as it&rsquo;s confirmed.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <a href={`/api/consultations/${done.id}/ics`} className={buttonClass({ variant: "outline", size: "sm" })}>
            <CalendarPlus size={15} aria-hidden /> Add to calendar
          </a>
          <Link href="/dashboard" className={buttonClass({ size: "sm" })}>
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card", compact ? "p-5" : "p-6")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-bold text-ink-900">
            <Video size={18} className="text-brand-600" aria-hidden /> Book a video consultation
          </p>
          <p className="mt-1 text-sm text-ink-500">30 minutes with {doctor.name.replace(/^Dr\.\s*/, "Dr. ")}</p>
        </div>
        <p className="font-display text-2xl font-bold text-ink-900">
          <Price usd={doctor.consultFeeUSD} />
        </p>
      </div>

      {!grid ? (
        <div className="mt-5 space-y-2">
          <div className="skeleton h-16 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      ) : (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink-400">Choose a day</p>
          <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto pb-1">
            {grid.days.map((d) => {
              const open = d.slots.some((s) => s.available);
              return (
                <button
                  key={d.date}
                  disabled={!open}
                  onClick={() => {
                    setDate(d.date);
                    setTime("");
                  }}
                  aria-pressed={date === d.date}
                  className={cn(
                    "flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 text-xs transition",
                    date === d.date ? "border-brand-600 bg-brand-600 text-white" : open ? "border-line bg-white text-ink-700 hover:border-brand-300" : "border-transparent bg-ink-50 text-ink-300"
                  )}
                >
                  <span>{formatDate(d.date, { weekday: "short" })}</span>
                  <span className="font-display text-lg font-bold">{d.date.slice(8)}</span>
                  <span className={date === d.date ? "text-white/80" : "text-ink-400"}>{formatDate(d.date, { month: "short" })}</span>
                </button>
              );
            })}
          </div>
          {day && (
            <>
              <p className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-400">
                <span>Choose a time</span>
                <span className="normal-case tracking-normal">{grid.timezone}</span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {day.slots.map((s) => {
                  const lt = localTime(date, s.time, grid.timeZone);
                  return (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setTime(s.time)}
                      aria-pressed={time === s.time}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                        time === s.time ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20" : s.available ? "border-line bg-white text-ink-800 hover:border-brand-300" : "border-transparent bg-ink-50 text-ink-300 line-through"
                      )}
                    >
                      {s.time}
                      {lt && s.available && <span className="block text-[10px] font-normal text-ink-400">{lt} your time</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {grid.days.every((d) => !d.slots.some((s) => s.available)) && <p className="mt-4 text-sm text-ink-500">No open slots in the next two weeks — request a call through your coordinator instead.</p>}

          <div className="mt-5 space-y-3">
            {cases.length > 0 && (
              <Select aria-label="Link to a case" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                <option value="">Not linked to a case</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    Case: {c.patientName} — {c.specialty || c.condition.slice(0, 40)}
                  </option>
                ))}
              </Select>
            )}
            <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={600} placeholder="What would you like to discuss? (optional)" aria-label="Reason for consultation" />
          </div>
          <FormError>{error}</FormError>
          {user?.role === "patient" ? (
            <Button onClick={book} disabled={!date || !time || busy} className="mt-4 w-full">
              <CalendarCheck size={17} aria-hidden /> {busy ? "Requesting…" : time ? `Request ${formatDate(date, { day: "numeric", month: "short" })} · ${time}` : "Pick a time"}
            </Button>
          ) : user ? (
            <p className="mt-4 rounded-xl bg-ink-50 p-3 text-center text-sm text-ink-500">Consultations are booked from a patient account.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonClass({ variant: "outline" })}>
                Log in to book
              </Link>
              <Link href={`/signup?next=${encodeURIComponent(pathname)}`} className={buttonClass()}>
                Create free account
              </Link>
            </div>
          )}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
            <Clock size={12} aria-hidden /> The fee is paid to the hospital once they confirm your slot.
            {yourZone ? ` Your time zone: ${yourZone}.` : ""}
          </p>
        </>
      )}
    </div>
  );
}
