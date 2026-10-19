"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, Menu, X, Search, LogOut, LayoutDashboard, UserRound, Building2, ShieldCheck,
  Calculator, Sparkles, Package, Stethoscope, Video, BookOpen, Scale,
} from "lucide-react";
import { CurrencySelect, api } from "@/components/ui/client";
import { buttonClass, cn, timeAgo } from "@/components/ui/core";
import Logo from "@/components/Logo";

const PRIMARY = [
  { href: "/treatments", label: "Treatments" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/doctors", label: "Doctors" },
  { href: "/countries", label: "Destinations" },
];

const RESOURCES = [
  { href: "/second-opinion", label: "Second opinion", desc: "A specialist reviews your reports", icon: Stethoscope },
  { href: "/consult", label: "Video consultation", desc: "Talk to a surgeon before you travel", icon: Video },
  { href: "/packages", label: "Packages", desc: "All-inclusive, fixed-price bundles", icon: Package },
  { href: "/calculator", label: "Cost calculator", desc: "Treatment + travel, line by line", icon: Calculator },
  { href: "/countries/compare", label: "Compare destinations", desc: "One procedure, side by side", icon: Scale },
  { href: "/match", label: "Find my match", desc: "Hospitals ranked for your needs", icon: Sparkles },
  { href: "/guides", label: "Patient guides", desc: "Visas, safety, recovery", icon: BookOpen },
];

function accountLinks(user) {
  if (!user) return [];
  if (user.role === "hospital")
    return [
      { href: `/hospital/${user.hospitalId}`, label: "Hospital portal", icon: Building2 },
      { href: `/hospital/${user.hospitalId}/profile`, label: "Hospital profile", icon: UserRound },
    ];
  if (user.role === "admin" || user.role === "coordinator") return [{ href: "/admin", label: "Operations console", icon: ShieldCheck }];
  return [
    { href: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
    { href: "/account", label: "Account settings", icon: UserRound },
  ];
}

function useOutside(ref, onOut) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

function Notifications({ solid }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));

  useEffect(() => {
    let alive = true;
    const load = () => api("/api/notifications").then((d) => alive && setItems(Array.isArray(d) ? d : [])).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;
  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread) {
      await api("/api/notifications", { method: "PATCH", body: {} }).catch(() => {});
      setItems((p) => p.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className={cn("relative inline-flex h-9 w-9 items-center justify-center rounded-full transition", solid ? "text-ink-600 hover:bg-ink-100" : "text-white/85 hover:bg-white/10")}
      >
        <Bell size={18} />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-white" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 z-50 mt-2 w-[min(88vw,360px)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            <p className="border-b border-line px-4 py-3 text-sm font-semibold text-ink-900">Notifications</p>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">You&rsquo;re all caught up.</p>
              ) : (
                items.slice(0, 20).map((n) => (
                  <Link key={n.id} href={n.link || "#"} onClick={() => setOpen(false)} className="block border-b border-line/60 px-4 py-3 text-sm last:border-0 hover:bg-ink-50">
                    <p className="text-ink-800">{n.message}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountMenu({ user, solid, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  const links = accountLinks(user);
  const first = (user.name || user.email || "?").split(" ")[0];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn("inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-3 text-sm font-semibold transition", solid ? "text-ink-800 hover:bg-ink-100" : "text-white hover:bg-white/10")}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-ink-700 text-xs font-bold text-white">{first[0]?.toUpperCase()}</span>
        <span className="hidden max-w-28 truncate md:inline">{first}</span>
        <ChevronDown size={14} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lift">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-ink-900">{user.name || user.email}</p>
              <p className="truncate text-xs text-ink-400">{user.email} · {user.role}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                <l.icon size={16} aria-hidden /> {l.label}
              </Link>
            ))}
            <button onClick={onLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50">
              <LogOut size={16} aria-hidden /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [resources, setResources] = useState(false);
  const resRef = useRef(null);
  useOutside(resRef, () => setResources(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMobile(false);
    setResources(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const solid = scrolled || mobile;

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  const openSearch = () => window.dispatchEvent(new Event("wc:open-search"));
  const linkCls = (href) =>
    cn(
      "rounded-full px-3 py-2 text-sm font-medium transition",
      pathname?.startsWith(href) ? (solid ? "text-ink-900 bg-ink-100/80" : "text-white bg-white/10") : solid ? "text-ink-600 hover:text-ink-900" : "text-white/80 hover:text-white"
    );

  return (
    <header
      data-site-nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-300",
        solid ? "border-b border-line/80 bg-white/90 shadow-[0_8px_30px_-20px_rgb(11_37_69/0.35)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900">
        Skip to content
      </a>
      <div className="container-wc flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="Whole Care home">
          <Logo dark={!solid} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>
              {l.label}
            </Link>
          ))}
          <div className="relative" ref={resRef}>
            <button onClick={() => setResources((o) => !o)} aria-expanded={resources} className={cn(linkCls("/__none"), "inline-flex items-center gap-1")}>
              Plan & compare <ChevronDown size={14} aria-hidden className={cn("transition", resources && "rotate-180")} />
            </button>
            <AnimatePresence>
              {resources && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-1/2 z-50 mt-3 grid w-[560px] -translate-x-1/2 grid-cols-2 gap-1 rounded-3xl border border-line bg-white p-3 shadow-lift"
                >
                  {RESOURCES.map((r) => (
                    <Link key={r.href} href={r.href} className="group flex gap-3 rounded-2xl p-3 transition hover:bg-ink-50">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                        <r.icon size={17} aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{r.label}</span>
                        <span className="block text-xs text-ink-500">{r.desc}</span>
                      </span>
                    </Link>
                  ))}
                  <Link href="/for-hospitals" className="col-span-2 mt-1 flex items-center justify-between rounded-2xl bg-ink-900 px-4 py-3 text-sm text-white">
                    <span>
                      <span className="font-semibold">For hospitals</span> <span className="text-ink-300">— run your international desk on Whole Care</span>
                    </span>
                    <Building2 size={18} aria-hidden />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={openSearch}
            className={cn(
              "hidden h-9 items-center gap-2 rounded-full border px-3 text-sm transition md:inline-flex",
              solid ? "border-line bg-white text-ink-500 hover:border-ink-300" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10"
            )}
          >
            <Search size={15} aria-hidden /> <span className="hidden xl:inline">Search</span>
            <kbd className={cn("hidden rounded-md px-1.5 text-[10px] font-semibold xl:inline", solid ? "bg-ink-100 text-ink-500" : "bg-white/10 text-white/70")}>⌘K</kbd>
          </button>
          <button onClick={openSearch} aria-label="Search" className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden", solid ? "text-ink-700" : "text-white")}>
            <Search size={18} />
          </button>
          <CurrencySelect dark={!solid} className="hidden sm:inline-flex" />
          {user && <Notifications solid={solid} />}
          {user ? (
            <AccountMenu user={user} solid={solid} onLogout={logout} />
          ) : (
            <Link href="/login" className={cn("hidden rounded-full px-3 py-2 text-sm font-semibold transition sm:inline-flex", solid ? "text-ink-700 hover:bg-ink-100" : "text-white hover:bg-white/10")}>
              Log in
            </Link>
          )}
          {(!user || user.role === "patient") && (
            <Link href="/get-quote" className={buttonClass({ variant: solid ? "primary" : "accent", size: "sm", className: "hidden sm:inline-flex" })}>
              Get a free quote
            </Link>
          )}
          <button
            onClick={() => setMobile((m) => !m)}
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden", solid ? "text-ink-900 hover:bg-ink-100" : "text-white hover:bg-white/10")}
          >
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 68px)" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-y-auto border-t border-line bg-white lg:hidden"
          >
            <div className="container-wc space-y-6 py-6">
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-2xl bg-ink-50 px-4 py-3 font-semibold text-ink-900">
                    {l.label}
                  </Link>
                ))}
              </div>
              <div>
                <p className="eyebrow mb-2 text-ink-400">Plan & compare</p>
                <div className="grid gap-1">
                  {RESOURCES.map((r) => (
                    <Link key={r.href} href={r.href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-ink-800 hover:bg-ink-50">
                      <r.icon size={18} className="text-brand-700" aria-hidden /> {r.label}
                    </Link>
                  ))}
                  <Link href="/for-hospitals" className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-ink-800 hover:bg-ink-50">
                    <Building2 size={18} className="text-brand-700" aria-hidden /> For hospitals
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-ink-50 px-4 py-3">
                <span className="text-sm font-medium text-ink-600">Currency</span>
                <CurrencySelect />
              </div>
              <div className="grid gap-2 pb-6">
                <Link href="/get-quote" className={buttonClass({ size: "lg" })}>
                  Get a free quote
                </Link>
                {user ? (
                  <>
                    {accountLinks(user).map((l) => (
                      <Link key={l.href} href={l.href} className={buttonClass({ variant: "outline", size: "lg" })}>
                        {l.label}
                      </Link>
                    ))}
                    <button onClick={logout} className={buttonClass({ variant: "ghost", size: "lg" })}>
                      Log out
                    </button>
                  </>
                ) : (
                  <Link href="/login" className={buttonClass({ variant: "outline", size: "lg" })}>
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

