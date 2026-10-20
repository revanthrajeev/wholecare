import Link from "next/link";
import Image from "next/image";
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
          <div className="relative min-h-64 overflow-hidden bg-ink-900 p-8 text-white">
            <Image src={featured.image} alt="" fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/10" />
            <div className="relative flex h-full min-h-48 flex-col justify-between">
              <Badge tone="dark" className="w-fit backdrop-blur">
                {featured.category}
              </Badge>
              <p className="mt-8 max-w-md font-display text-3xl font-bold leading-tight">{featured.title}</p>
            </div>
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
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover group flex flex-col overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
                <Image src={g.image} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <Badge tone="brand" className="w-fit">
                  {g.category}
                </Badge>
                <p className="mt-4 font-display text-xl font-bold leading-snug text-ink-900">{g.title}</p>
                <p className="mt-2 flex-1 text-sm text-ink-500">{g.excerpt}</p>
                <p className="mt-5 flex items-center gap-2 text-xs text-ink-400">
                  <Clock size={13} aria-hidden /> {g.readMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
