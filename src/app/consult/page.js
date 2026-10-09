"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

function nextDays(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const TIME_SLOTS = ["09:00", "10:30", "13:00", "15:00", "17:30"];

export default function ConsultBooking() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ doctorId: "", date: "", timeSlot: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user || d.user.role !== "patient") {
        router.push("/login?next=/consult");
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  useEffect(() => {
    fetch("/api/doctors").then((r) => r.json()).then(setDoctors);
    fetch("/api/hospitals").then((r) => r.json()).then(setHospitals);
  }, []);

  if (checkingAuth) return <main className="min-h-screen bg-white text-[#10243E] flex items-center justify-center">Loading&hellip;</main>;

  const days = nextDays(10);
  const inputClass =
    "w-full bg-[#F7FAFD] border border-[#E3EAF2] rounded-xl px-4 py-3 text-[#10243E] placeholder:text-[#9AADBD] focus:outline-none focus:ring-2 focus:ring-[#2F6FED] focus:border-transparent transition";
  const labelClass = "text-sm font-semibold text-[#5B7184] mb-2 block";

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    setConfirmed(data);
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-white text-[#10243E]">
        <Nav />
        <div className="max-w-lg mx-auto px-6 pt-40 pb-20 text-center">
          <div className="rounded-2xl wc-card p-10">
            <p className="text-[#2F6FED] font-bold uppercase text-xs tracking-widest mb-3">Consultation requested</p>
            <h1 className="text-2xl font-extrabold mb-4">You&rsquo;re booked with {confirmed.doctorName}</h1>
            <p className="text-[#5B7184] text-sm">
              {confirmed.hospitalName} &middot; {confirmed.specialty}<br />
              {new Date(confirmed.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at {confirmed.timeSlot}
            </p>
            <p className="text-[#9AADBD] text-xs mt-6">A care coordinator will confirm this slot and send video-call details before your appointment.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-xl mx-auto px-6 pt-32 pb-20">
        <p className="text-[#2F6FED] font-bold tracking-wide uppercase text-sm mb-2">Book a Consultation</p>
        <h1 className="text-4xl font-extrabold mb-3">Talk to a specialist first</h1>
        <p className="text-[#5B7184] mb-10">No full case needed yet — book a video consultation to discuss your condition before committing to anything.</p>

        <form onSubmit={submit} className="rounded-2xl p-8 wc-card space-y-5">
          <div>
            <label className={labelClass}>Doctor</label>
            <select required className={inputClass} value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select a doctor</option>
              {doctors.map((d) => {
                const h = hospitals.find((x) => x.id === d.hospitalId);
                return <option key={d.id} value={d.id}>{d.name} — {d.specialty} ({h?.name})</option>;
              })}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <select required className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}>
                <option value="">Select a date</option>
                {days.map((d) => (
                  <option key={d} value={d}>{new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Time slot</label>
              <select required className={inputClass} value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
                <option value="">Select a time</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>What would you like to discuss? (optional)</label>
            <textarea rows={3} className={inputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. second opinion on a knee replacement recommendation" />
          </div>
          {error && <p className="text-sm text-[#C23B5A] font-medium">{error}</p>}
          <button disabled={submitting} className="w-full btn-grad py-3.5 rounded-xl font-bold disabled:opacity-50">
            {submitting ? "Booking..." : "Request consultation"}
          </button>
        </form>
      </div>
    </main>
  );
}
