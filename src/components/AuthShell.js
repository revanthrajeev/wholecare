import { ShieldCheck, ReceiptText, HeartPulse, Users } from "lucide-react";
import Logo from "@/components/Logo";

export default function AuthShell({ title, subtitle, children, side }) {
  return (
    <section className="grid grid-cols-1 min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="hero-night relative hidden overflow-hidden px-12 pb-12 pt-32 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
        <div className="relative">
          <Logo dark />
          <p className="mt-10 max-w-md font-display text-4xl font-bold leading-tight">
            {side?.title || (
              <>
                Your whole care journey, in <span className="font-serif font-normal italic text-gradient">one</span> place.
              </>
            )}
          </p>
          <ul className="mt-10 space-y-5">
            {(side?.points || [
              [ReceiptText, "Itemized quotes from verified hospitals"],
              [ShieldCheck, "Your records shared only with hospitals you choose"],
              [HeartPulse, "Recovery plan and follow-ups after you fly home"],
              [Users, "A private family link to keep everyone updated"],
            ]).map(([Icon, t]) => (
              <li key={t} className="flex items-center gap-3 text-ink-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-glow ring-1 ring-white/10">
                  <Icon size={18} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-ink-400">Whole Care coordinates care and never provides medical advice.</p>
      </div>
      <div className="flex items-center justify-center bg-surface px-5 pb-16 pt-28 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
