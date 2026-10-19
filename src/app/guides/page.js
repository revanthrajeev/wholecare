import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { PageHeader, Badge, formatDate } from "@/components/ui/core";
import { GUIDES } from "@/content/guides";

export const metadata = {
  title: "Patient guides — planning treatment abroad",
  description: "Practical guides on medical visas, hospital accreditation, reading quotes, second opinions and flying home after surgery.",
};

export default function GuidesPage() {
  const [featured, ...rest] = GUIDES;
  return (
    <>
      <PageHeader eyebrow="Patient guides" title="Plan with confidence" description="Plain-language guides written to help you ask better questions. General information only — your clinicians advise on your case." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guides" }]} />
      <section className="container-wc py-12">
        <Link href={`/guides/${featured.slug}`} className="card card-hover group grid grid-cols-1 overflow-hidden md:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-56 bg-gradient-to-br from-ink-900 via-ink-800 to-brand-700 p-8 text-white">
            <div aria-hidden className="absolute -right-10 -top-10 h-56 w-56 rounded-full border-[24px] border-white/10" />
            <Badge tone="dark">{featured.category}</Badge>
            <p className="mt-8 max-w-md font-display text-3xl font-bold leading-tight">{featured.title}</p>
          </div>
          <div className="flex flex-col justify-center p-8">
            <p className="text-lg text-ink-600">{featured.excerpt}</p>
            <p className="mt-4 flex items-center gap-3 text-sm text-ink-400">
              <Clock size={14} aria-hidden /> {featured.readMinutes} min read · Updated {formatDate(featured.updated)}
            </p>
            <span className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-700">
              Read the guide <ArrowUpRight size={16} aria-hidden />
            </span>
          </div>
        </Link>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover flex flex-col p-6">
              <Badge tone="brand" className="w-fit">
                {g.category}
              </Badge>
              <p className="mt-4 font-display text-xl font-bold leading-snug text-ink-900">{g.title}</p>
              <p className="mt-2 flex-1 text-sm text-ink-500">{g.excerpt}</p>
              <p className="mt-5 flex items-center gap-2 text-xs text-ink-400">
                <Clock size={13} aria-hidden /> {g.readMinutes} min read
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
