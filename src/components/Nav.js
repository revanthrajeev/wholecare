"use client";
import Link from "next/link";

export default function Nav({ dark = true }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-5 backdrop-blur-md bg-[#05090d]/70 border-b border-white/10">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md wc-gradient" />
        <span className="font-extrabold tracking-wide text-white">WHOLE CARE</span>
      </Link>
      <nav className="hidden md:flex gap-8 text-sm text-[#9db3c4]">
        <Link href="/directory" className="hover:text-white transition">Directory</Link>
        <Link href="/calculator" className="hover:text-white transition">Cost Calculator</Link>
        <Link href="/hospital" className="hover:text-white transition">Hospital Portal</Link>
      </nav>
      <Link
        href="/case/new"
        className="btn-grad text-sm font-bold px-5 py-2.5 rounded-full"
      >
        Start a Case
      </Link>
    </header>
  );
}
