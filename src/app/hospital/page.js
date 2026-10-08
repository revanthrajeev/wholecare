"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

export default function HospitalPortalEntry() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user && d.user.role === "hospital") {
        router.push(`/hospital/${d.user.hospitalId}`);
      } else {
        router.push("/login?next=/hospital");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-[#10243E]">
      <Nav />
      <div className="max-w-md mx-auto px-6 pt-40 pb-20 text-center text-[#5B7184]">Redirecting to hospital login&hellip;</div>
    </main>
  );
}
