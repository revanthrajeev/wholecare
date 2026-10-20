import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, Info, AlertTriangle, ArrowRight } from "lucide-react";
import { Breadcrumbs, Badge, Button, formatDate } from "@/components/ui/core";
import { GUIDES, guideBySlug } from "@/content/guides";

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return { title: "Guide not found" };
  return { title: g.title, description: g.excerpt, openGraph: { type: "article", title: g.title, description: g.excerpt } };
}

function Block({ b }) {
  if (b.type === "h2") return <h2 className="mt-10 text-2xl font-bold text-ink-900">{b.text}</h2>;
  if (b.type === "ul")
    return (
      <ul className="mt-4 space-y-2.5">
        {b.items.map((i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    );
  if (b.type === "ol")
    return (
      <ol className="mt-4 space-y-3">
        {b.items.map((i, n) => (
          <li key={i} className="flex gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">{n + 1}</span>
            <span className="pt-0.5">{i}</span>
          </li>
        ))}
      </ol>
    );
  if (b.type === "callout") {
    const warn = b.tone === "warning";
    const Icon = warn ? AlertTriangle : Info;
    return (
      <aside className={`mt-8 flex gap-4 rounded-2xl border p-5 ${warn ? "border-sun-100 bg-sun-50" : "border-brand-100 bg-brand-50"}`}>
        <Icon size={20} className={`mt-0.5 shrink-0 ${warn ? "text-sun-700" : "text-brand-700"}`} aria-hidden />
        <div>
          <p className={`font-semibold ${warn ? "text-sun-700" : "text-brand-800"}`}>{b.title}</p>
          <p className="mt-1 text-ink-700">{b.text}</p>
        </div>
      </aside>
    );
  }
  return <p className="mt-5">{b.text}</p>;
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const more = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.excerpt, dateModified: g.updated, publisher: { "@type": "Organization", name: "Whole Care" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <Image src={g.image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/80 to-ink-950/45" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/40" />
        <div className="container-wc relative max-w-4xl pb-14 pt-28 md:pt-32">
          <Breadcrumbs dark items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }, { label: g.category }]} />
          <Badge tone="dark" className="mt-8">
            {g.category}
          </Badge>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{g.title}</h1>
          <p className="mt-4 text-xl text-ink-300">{g.excerpt}</p>
          <p className="mt-6 flex items-center gap-3 text-sm text-ink-400">
            <Clock size={14} aria-hidden /> {g.readMinutes} min read · Updated {formatDate(g.updated)}
          </p>
        </div>
      </section>
      <article className="container-wc max-w-3xl py-14 text-[17px] leading-relaxed text-ink-700">
        {g.body.map((b, i) => (
          <Block key={i} b={b} />
        ))}
        <div className="mt-12 rounded-3xl bg-ink-900 p-8 text-white">
          <p className="font-display text-2xl font-bold">Ready to get specific?</p>
          <p className="mt-2 text-ink-300">Share your reports once and receive itemized quotes from verified hospitals — free for patients.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/get-quote" variant="accent">
              Get a free quote
            </Button>
            <Button href="/second-opinion" variant="ghostDark">
              Second opinion
            </Button>
          </div>
        </div>
        <p className="mt-8 text-sm text-ink-400">This guide is general information, not medical advice. Always follow the advice of the clinicians treating you.</p>
      </article>
      <section className="border-t border-line bg-white py-14">
        <div className="container-wc">
          <p className="text-lg font-bold text-ink-900">More guides</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/guides/${m.slug}`} className="card card-hover group overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
                  <Image src={m.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-brand-700">{m.category}</p>
                  <p className="mt-2 font-semibold text-ink-900">{m.title}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-ink-500">
                    Read <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
