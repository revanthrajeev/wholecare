"use client";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/components/ui/core";

export default function Accordion({ items, defaultOpen = 0, dark }) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();
  return (
    <div className={cn("divide-y rounded-3xl border", dark ? "divide-white/10 border-white/10" : "card divide-line")}>
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div key={it.q}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={id}
                className={cn("flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-base font-semibold transition", dark ? "text-white hover:text-glow" : "text-ink-900 hover:text-brand-700")}
              >
                {it.q}
                <Plus size={18} aria-hidden className={cn("shrink-0 transition-transform duration-300", isOpen && "rotate-45")} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                  <p className={cn("px-6 pb-6 text-[15px] leading-relaxed", dark ? "text-ink-300" : "text-ink-500")}>{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
