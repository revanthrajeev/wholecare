"use client"; // Error boundaries must be Client Components
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { buttonClass } from "@/components/ui/core";

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="hero-night relative overflow-hidden text-white">
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />
      <div className="container-wc relative flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
        <p className="eyebrow text-glow">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">We couldn&rsquo;t load this page</h1>
        <p className="mt-4 max-w-lg text-ink-300">Nothing you entered has been lost. Try again — if it keeps happening, our coordinators can help by email or WhatsApp.</p>
        {error?.digest && <p className="mt-3 font-mono text-xs text-ink-400">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className={buttonClass({ variant: "accent", size: "lg" })}>
            <RotateCcw size={18} aria-hidden /> Try again
          </button>
          <Link href="/contact" className={buttonClass({ variant: "ghostDark", size: "lg" })}>
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
