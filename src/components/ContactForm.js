"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Field, Input, Select, Textarea, FormError } from "@/components/ui/core";
import { api } from "@/components/ui/client";

export default function ContactForm({ initialTopic = "patient", source = "contact" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: initialTopic, message: "" });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setState("busy");
    try {
      await api("/api/inquiries", { method: "POST", body: { ...form, source } });
      setState("done");
    } catch (err) {
      setError(err.message);
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-ok-600" aria-hidden />
        <p className="mt-4 font-display text-2xl font-bold text-ink-900">Thanks, {form.name.split(" ")[0] || "we've got it"}!</p>
        <p className="mt-2 text-ink-500">A coordinator will reply to {form.email} within one working day.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="c-name">
          <Input id="c-name" required value={form.name} onChange={set("name")} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="c-email">
          <Input id="c-email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" htmlFor="c-phone" optional>
          <Input id="c-phone" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+44 …" />
        </Field>
        <Field label="I'm asking about" htmlFor="c-topic">
          <Select id="c-topic" value={form.topic} onChange={set("topic")}>
            <option value="patient">Treatment for me or my family</option>
            <option value="partnership">Hospital partnership</option>
            <option value="press">Press or investors</option>
            <option value="other">Something else</option>
          </Select>
        </Field>
      </div>
      <Field label="Message" htmlFor="c-msg">
        <Textarea id="c-msg" rows={5} required value={form.message} onChange={set("message")} placeholder="Tell us what you need — please don't include detailed medical records here; you can upload them securely in a case." />
      </Field>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={state === "busy"} className="w-full sm:w-auto">
        {state === "busy" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
