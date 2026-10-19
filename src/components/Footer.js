import Link from "next/link";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Patients",
    links: [
      ["/get-quote", "Get a free quote"],
      ["/second-opinion", "Second opinion"],
      ["/consult", "Video consultation"],
      ["/packages", "Packages"],
      ["/calculator", "Cost calculator"],
      ["/countries/compare", "Compare destinations"],
    ],
  },
  {
    title: "Explore",
    links: [
      ["/treatments", "Treatments & prices"],
      ["/hospitals", "Hospitals"],
      ["/doctors", "Doctors"],
      ["/countries", "Destinations"],
      ["/match", "Find my match"],
      ["/guides", "Patient guides"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "About Whole Care"],
      ["/about#verification", "How we verify hospitals"],
      ["/for-hospitals", "For hospitals"],
      ["/signup/hospital", "List your hospital"],
      ["/contact", "Contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/legal/terms", "Terms of use"],
      ["/legal/privacy", "Privacy policy"],
      ["/legal/medical-disclaimer", "Medical disclaimer"],
    ],
  },
];

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <footer data-site-footer className="relative overflow-hidden bg-ink-950 text-ink-300">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-brand-600/10 blur-3xl" />
      <div className="container-wc relative grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-ink-400">
            Coordinated medical travel — specialist opinions, itemized quotes, travel and aftercare in one case room, from first message to full recovery.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link href="/contact" className="rounded-full border border-white/15 px-4 py-2 text-white transition hover:bg-white/10">
              Talk to a coordinator
            </Link>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-white transition hover:bg-white/10">
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-sm font-semibold text-white">{c.title}</p>
              <ul className="space-y-2.5 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink-400 transition hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-wc flex flex-col gap-3 py-6 text-xs leading-relaxed text-ink-500 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            Whole Care coordinates care and does not provide medical advice, diagnosis or treatment — clinical decisions are made by licensed clinicians at the hospital you choose. Prices shown are indicative until a hospital issues a quote. Listings marked &ldquo;Sample&rdquo; are demonstration data, not contracted partners.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} Whole Care</p>
        </div>
      </div>
    </footer>
  );
}
