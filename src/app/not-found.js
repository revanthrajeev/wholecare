import Link from "next/link";
import { Stethoscope, Building2, Calculator, MessageCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/core";

const LINKS = [
  ["/treatments", "Treatment prices", Stethoscope],
  ["/hospitals", "Verified hospitals", Building2],
  ["/calculator", "Cost calculator", Calculator],
  ["/contact", "Talk to a coordinator", MessageCircle],
];

export default function NotFound() {
  return (
    <section className="hero-night relative overflow-hidden text-white">
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
      <div className="container-wc relative flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p aria-hidden className="font-display text-[110px] font-bold leading-none text-white/10 md:text-[170px]">
          404
        </p>
        <h1 className="-mt-4 text-3xl font-bold md:text-5xl">This page took a different flight</h1>
        <p className="mt-4 max-w-lg text-ink-300">The link may be old or mistyped. These are the places most people are looking for:</p>
        <div className="mt-10 grid grid-cols-1 w-full max-w-2xl gap-3 sm:grid-cols-2">
          {LINKS.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-left transition hover:border-white/25 hover:bg-white/10">
              <Icon size={20} className="shrink-0 text-glow" aria-hidden />
              <span className="font-semibold">{label}</span>
            </Link>
          ))}
        </div>
        <Link href="/" className={buttonClass({ variant: "accent", size: "lg", className: "mt-10" })}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
