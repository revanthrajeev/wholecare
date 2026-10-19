"use client";
import Link from "next/link";
import { Scale, Check } from "lucide-react";
import { useCompareList } from "@/components/HospitalsBrowser";
import { buttonClass } from "@/components/ui/core";

export default function CompareToggle({ slug, dark }) {
  const compare = useCompareList();
  const on = compare.ids.includes(slug);
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => compare.toggle(slug)} className={buttonClass({ variant: dark ? "ghostDark" : "outline", size: "lg" })} aria-pressed={on}>
        {on ? <Check size={18} aria-hidden /> : <Scale size={18} aria-hidden />} {on ? "Added to compare" : "Compare"}
      </button>
      {on && compare.ids.length >= 2 && (
        <Link href={`/hospitals/compare?ids=${compare.ids.join(",")}`} className="text-sm font-semibold text-glow hover:underline">
          Compare {compare.ids.length} →
        </Link>
      )}
    </div>
  );
}
