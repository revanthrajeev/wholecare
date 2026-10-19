"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/components/ui/core";

const SUGGESTIONS = ["Knee replacement cost in India?", "How do medical visas work?", "Is it safe to have surgery abroad?", "IVF in Malaysia vs Turkey"];
const STORE = "wc-assistant-v1";
const HIDDEN_PREFIXES = ["/admin", "/hospital/", "/quote/", "/consultations/"];

export default function AssistantWidget() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  // The conversation survives page changes in this tab; it's restored the first time the panel opens.
  const restored = useRef(false);
  function restore() {
    if (restored.current) return messages;
    restored.current = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "[]");
      if (Array.isArray(saved) && saved.length) {
        setMessages(saved);
        return saved;
      }
    } catch {}
    return messages;
  }
  function openPanel() {
    restore();
    setOpen(true);
  }

  useEffect(() => {
    if (restored.current) {
      try {
        sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-20)));
      } catch {}
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    const onOpen = (e) => {
      const prior = restore();
      setOpen(true);
      if (e.detail?.question) send(e.detail.question, prior);
    };
    window.addEventListener("wc:open-assistant", onOpen);
    return () => window.removeEventListener("wc:open-assistant", onOpen);
  });

  async function send(text, base = messages) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const next = [...base, { role: "user", content: q }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || data.error || "Sorry — something went wrong.", actions: data.actions || [] }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't connect just now. Please try again, or contact a coordinator.", actions: [{ label: "Contact", href: "/contact" }] }]);
    } finally {
      setBusy(false);
    }
  }

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <div data-no-print className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.section
            aria-label="Whole Care assistant"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
            className="flex h-[min(620px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-lift"
          >
            <header className="hero-night relative flex items-center gap-3 px-5 py-4 text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Sparkles size={18} className="text-glow" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="font-display font-bold">Ask Whole Care</p>
                <p className="text-xs text-ink-300">Prices, destinations, visas &amp; the process</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close assistant" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
                <X size={18} />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-ink-800 shadow-soft">
                Hi! I can compare indicative prices across countries, explain visas and travel, and point you to the right next step. I can&rsquo;t give medical advice.
              </div>
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-800 transition hover:bg-brand-50">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink-900 px-4 py-2.5 text-sm text-white">
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="max-w-[90%] space-y-2">
                    <div className="whitespace-pre-line rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-relaxed text-ink-800 shadow-soft">{m.content}</div>
                    {m.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.actions.map((a) => (
                          <Link key={a.href + a.label} href={a.href} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-800">
                            {a.label} <ArrowUpRight size={12} aria-hidden />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
              {busy && (
                <div className="inline-flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-soft" aria-label="Assistant is typing">
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="h-1.5 w-1.5 rounded-full bg-ink-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-line bg-white p-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface pl-4 pr-1.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={1500}
                  placeholder="Ask about a treatment or country…"
                  aria-label="Your question"
                  className="h-11 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
                <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800 disabled:opacity-40">
                  <Send size={15} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-ink-400">
                <span>General information — not medical advice.</span>
                <span className="flex gap-3">
                  <Link href="/contact" className="font-semibold text-brand-700 hover:underline" onClick={() => setOpen(false)}>
                    Talk to a human
                  </Link>
                  {whatsapp && (
                    <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                      WhatsApp
                    </a>
                  )}
                </span>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={cn("relative inline-flex h-14 items-center gap-2 rounded-full px-5 font-semibold text-white shadow-lift ring-1 ring-white/15 transition", open ? "bg-ink-900" : "bg-gradient-to-r from-brand-700 to-ink-800")}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="relative hidden text-sm sm:inline">{open ? "Close" : "Ask Whole Care"}</span>
      </motion.button>
    </div>
  );
}
