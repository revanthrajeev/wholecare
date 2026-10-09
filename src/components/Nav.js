"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications").then((r) => r.json()).then(setNotifications);
    const interval = setInterval(() => {
      fetch("/api/notifications").then((r) => r.json()).then(setNotifications);
    }, 20000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;
  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F3F7FC] transition"
      >
        <Bell size={18} className="text-[#5B7184]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B81]" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl wc-card p-2 z-40">
          {notifications.length === 0 ? (
            <p className="text-sm text-[#9AADBD] p-4 text-center">No notifications yet.</p>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <Link
                key={n.id}
                href={n.link || "#"}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl hover:bg-[#F3F7FC] transition text-sm"
              >
                <p className="text-[#344A61]">{n.message}</p>
                <p className="text-[#9AADBD] text-xs mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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
      <nav className="hidden xl:flex gap-6 text-sm text-[#5B7184]">
        <Link href="/directory" className="hover:text-[#10243E] transition">Directory</Link>
        <Link href="/match" className="hover:text-[#10243E] transition">Find My Match</Link>
        <Link href="/countries" className="hover:text-[#10243E] transition">Country Guides</Link>
        <Link href="/consult" className="hover:text-[#10243E] transition">Book Consultation</Link>
        <Link href="/calculator" className="hover:text-[#10243E] transition">Cost Calculator</Link>
        <Link href="/hospital" className="hover:text-[#10243E] transition">Hospital Portal</Link>
        {user && user.role === "patient" && (
          <Link href="/dashboard" className="hover:text-[#10243E] transition">My Cases</Link>
        )}
      </nav>
      <div className="flex items-center gap-3">
        <NotificationBell user={user} />
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
