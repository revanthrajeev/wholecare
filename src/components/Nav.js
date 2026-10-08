"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-5 backdrop-blur-md bg-white/80 border-b border-[#E3EAF2]">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md wc-gradient" />
        <span className="font-extrabold tracking-wide text-[#10243E]">WHOLE CARE</span>
      </Link>
      <nav className="hidden md:flex gap-8 text-sm text-[#5B7184]">
        <Link href="/directory" className="hover:text-[#10243E] transition">Directory</Link>
        <Link href="/calculator" className="hover:text-[#10243E] transition">Cost Calculator</Link>
        <Link href="/hospital" className="hover:text-[#10243E] transition">Hospital Portal</Link>
        {user && user.role === "patient" && (
          <Link href="/dashboard" className="hover:text-[#10243E] transition">My Cases</Link>
        )}
      </nav>
      <div className="flex items-center gap-3">
        {user === undefined ? null : user ? (
          <>
            <span className="text-sm text-[#5B7184] hidden sm:inline">{user.name || user.email}</span>
            <button onClick={logout} className="text-sm font-semibold text-[#5B7184] hover:text-[#10243E] transition">
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="text-sm font-semibold text-[#5B7184] hover:text-[#10243E] transition">
            Log in
          </Link>
        )}
        <Link href="/case/new" className="btn-grad text-sm font-bold px-5 py-2.5 rounded-full">
          Start a Case
        </Link>
      </div>
    </header>
  );
}
