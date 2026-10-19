"use client";
import Link from "next/link";
import { Users, Copy, RefreshCw, Eye, EyeOff, ShieldCheck, ExternalLink } from "lucide-react";
import { Button, buttonClass, cn } from "@/components/ui/core";
import { useToast } from "@/components/ui/client";
import { useIsClient } from "@/lib/useIsClient";

export default function FamilyTab({ data, act, busy }) {
  const { toast } = useToast();
  const share = data.case.share || {};
  const origin = useIsClient() ? window.location.origin : "";
  const link = share.token ? `${origin}/track/${share.token}` : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copied");
    } catch {
      toast("Copy failed — select the link and copy it manually.", "error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
      <section className="card p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Users size={22} aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink-900">Private family link</p>
            <p className="mt-1 text-sm text-ink-500">Let relatives follow progress without calling you for updates. They see the case stage and milestones — never your documents, messages or quotes.</p>
          </div>
        </div>
        <div className={cn("mt-6 rounded-2xl border p-4", share.enabled ? "border-brand-200 bg-brand-50/60" : "border-line bg-ink-50")}>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              {share.enabled ? <Eye size={16} className="text-brand-700" aria-hidden /> : <EyeOff size={16} className="text-ink-400" aria-hidden />}
              {share.enabled ? "Link is on" : "Link is off"}
            </p>
            <Button size="sm" variant={share.enabled ? "outline" : "primary"} disabled={busy} onClick={() => act("share", { enabled: !share.enabled }, share.enabled ? "Family link switched off" : "Family link created")}>
              {share.enabled ? "Turn off" : "Create link"}
            </Button>
          </div>
          {share.enabled && link && (
            <>
              <div className="mt-4 flex items-center gap-2">
                <input readOnly value={link} aria-label="Family link" className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink-700" onFocus={(e) => e.target.select()} />
                <button onClick={copy} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink-600 hover:border-ink-300" aria-label="Copy link">
                  <Copy size={16} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  Preview <ExternalLink size={13} aria-hidden />
                </a>
                <button disabled={busy} onClick={() => act("share", { enabled: true, regenerate: true }, "New link created — the old one no longer works")} className="inline-flex items-center gap-1 font-semibold text-ink-600 hover:text-ink-900">
                  <RefreshCw size={13} aria-hidden /> New link
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Follow ${data.case.patientName.split(" ")[0]}'s treatment updates: ${link}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink-600 hover:text-ink-900">
                  Share on WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="card p-6">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <ShieldCheck size={18} className="text-brand-600" aria-hidden /> What relatives see
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            ["Patient's first name and case stage", true],
            ["Milestones (arrived, surgery done, discharged…)", true],
            ["Hospital name and city", true],
            ["Medical documents and reports", false],
            ["Messages, quotes and prices", false],
          ].map(([t, yes]) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", yes ? "bg-ok-50 text-ok-700" : "bg-ink-100 text-ink-400")}>{yes ? "✓" : "–"}</span>
              <span className={yes ? "text-ink-800" : "text-ink-400"}>{t}</span>
            </li>
          ))}
        </ul>
        <Link href="/legal/privacy" className={buttonClass({ variant: "ghost", size: "sm", className: "mt-5 -ml-3" })}>
          Privacy details
        </Link>
      </section>
    </div>
  );
}
