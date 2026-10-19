"use client";
import { useEffect, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { cn, formatDateTime } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";

const ROLE_STYLE = {
  hospital: "bg-white text-ink-800 ring-1 ring-line",
  coordinator: "bg-sun-50 text-ink-800 ring-1 ring-sun-100",
  patient: "bg-white text-ink-800 ring-1 ring-line",
};

export default function MessagesPanel({ caseId, meId, disabledReason, placeholder = "Write a message…" }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api(`/api/cases/${caseId}/messages`)
        .then((m) => alive && setMessages(m))
        .catch(() => alive && setMessages([]));
    load();
    const t = setInterval(load, 12000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [caseId]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages?.length]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const m = await api(`/api/cases/${caseId}/messages`, { method: "POST", body: { text } });
      setMessages((prev) => [...(prev || []), m]);
      setText("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex h-[560px] flex-col overflow-hidden">
      <div ref={list} className="flex-1 space-y-3 overflow-y-auto bg-surface p-4 sm:p-5">
        {messages === null ? (
          <div className="space-y-3">
            <div className="skeleton h-14 w-2/3 rounded-2xl" />
            <div className="skeleton ml-auto h-12 w-1/2 rounded-2xl" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-ink-400">
            <MessageSquare size={28} aria-hidden />
            <p className="mt-3 text-sm">No messages yet. Questions you send here go to the hospitals on your case and your coordinator.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-soft", mine ? "rounded-br-md bg-ink-900 text-white" : cn("rounded-bl-md", ROLE_STYLE[m.senderRole] || ROLE_STYLE.patient))}>
                  <p className={cn("text-xs font-semibold", mine ? "text-ink-300" : m.senderRole === "coordinator" ? "text-sun-700" : "text-brand-700")}>{mine ? "You" : m.senderLabel}</p>
                  <p className="mt-0.5 whitespace-pre-line leading-relaxed">{m.text}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-ink-400" : "text-ink-400")}>{formatDateTime(m.at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {disabledReason ? (
        <p className="border-t border-line bg-white px-5 py-4 text-sm text-ink-500">{disabledReason}</p>
      ) : (
        <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-white p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) send(e);
            }}
            rows={1}
            maxLength={4000}
            placeholder={placeholder}
            aria-label="Message"
            className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
          />
          <button disabled={busy || !text.trim()} aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-40">
            <Send size={17} />
          </button>
        </form>
      )}
    </div>
  );
}
