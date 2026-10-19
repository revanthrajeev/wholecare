"use client";
import { Printer } from "lucide-react";
import { buttonClass } from "@/components/ui/core";

export default function PrintButton({ label = "Print / save as PDF" }) {
  return (
    <button onClick={() => window.print()} className={buttonClass({ variant: "outline", size: "sm" })} data-no-print>
      <Printer size={15} aria-hidden /> {label}
    </button>
  );
}
