import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";
import { extendTailwindMerge } from "tailwind-merge";

// Tailwind resolves two classes for the same property by stylesheet order, so a caller's "w-auto"
// could silently lose to a base "w-full". Merging keeps the last one, as written.
const merge = extendTailwindMerge({
  extend: {
    theme: { shadow: ["soft", "lift", "glow"] },
    classGroups: { "text-gradient": ["text-gradient"] },
  },
});

export function cn(...parts) {
  return merge(...parts);
}

const BUTTON_VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-[0_10px_24px_-12px_rgb(11_115_105/0.7)]",
  accent: "bg-glow text-ink-950 hover:bg-[#8ff3e2] shadow-glow",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  outline: "bg-white text-ink-900 border border-line hover:border-ink-300 hover:bg-ink-50",
  ghostDark: "text-white border border-white/20 hover:bg-white/10",
  ghost: "text-ink-700 hover:bg-ink-100/70",
  danger: "bg-rose-600 text-white hover:bg-[#a52a3d]",
  soft: "bg-brand-50 text-brand-800 hover:bg-brand-100",
};
const BUTTON_SIZES = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass({ variant = "primary", size = "md", className } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  );
}

export function Button({ href, external, variant, size, className, children, ...props }) {
  const cls = buttonClass({ variant, size, className });
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type={props.type || "button"} className={cls} {...props}>
      {children}
    </button>
  );
}

const BADGE_TONES = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  neutral: "bg-ink-50 text-ink-600 ring-ink-200",
  sun: "bg-sun-50 text-sun-700 ring-sun-100",
  coral: "bg-coral-50 text-coral-700 ring-[#f6c9b4]",
  success: "bg-ok-50 text-ok-700 ring-[#bfe5cb]",
  danger: "bg-[#fdecef] text-rose-600 ring-[#f6c3cb]",
  dark: "bg-white/10 text-white ring-white/20",
  ink: "bg-ink-900 text-white ring-ink-900",
};

export function Badge({ tone = "neutral", icon: Icon, className, children, title }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap", BADGE_TONES[tone], className)}>
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  );
}

export function SampleBadge({ className }) {
  return (
    <Badge tone="neutral" className={className} title="Demonstration listing — not a contracted partner">
      Sample
    </Badge>
  );
}

const FIELD = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:bg-ink-50";
export const fieldClass = FIELD;

export function Label({ htmlFor, children, hint, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-ink-700">
      <span>
        {children}
        {optional && <span className="ml-1 font-normal text-ink-400">(optional)</span>}
      </span>
      {hint && <span className="text-xs font-normal text-ink-400">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(FIELD, className)} {...props} />;
}

export function Textarea({ className, rows = 3, ...props }) {
  return <textarea rows={rows} className={cn(FIELD, "resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(FIELD, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235a6f8a%22 stroke-width=%222.5%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({ label, htmlFor, hint, optional, error, children, className }) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor} hint={hint} optional={optional}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl bg-[#fdecef] px-4 py-3 text-sm font-medium text-rose-600">{children}</p>;
}

const AVATAR_PALETTES = [
  ["#0b7369", "#23b3a2"],
  ["#1b4372", "#3b82c4"],
  ["#8a5a00", "#f5a524"],
  ["#a3431a", "#e8713c"],
  ["#4c3d99", "#8b7cf0"],
];

export function hashString(s = "") {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function initials(name = "") {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = 48, className, ring }) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <span className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-ink-100", ring && "ring-4 ring-white", className)} style={style}>
        <Image src={src} alt={name || ""} fill sizes={`${size * 2}px`} className="object-cover" />
      </span>
    );
  }
  const [a, b] = AVATAR_PALETTES[hashString(name) % AVATAR_PALETTES.length];
  return (
    <span
      aria-hidden={!name}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white", ring && "ring-4 ring-white", className)}
      style={{ ...style, background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: Math.max(11, size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}

export function Stars({ rating = 0, size = 14, className }) {
  const full = Math.round(rating);
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} aria-hidden className={i < full ? "fill-sun-500 text-sun-500" : "fill-ink-100 text-ink-200"} />
      ))}
    </span>
  );
}

export function RatingPill({ rating, count, dark }) {
  if (!rating) return <span className={cn("text-xs", dark ? "text-white/60" : "text-ink-400")}>No reviews yet</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", dark ? "text-white" : "text-ink-900")}>
      <Star size={14} aria-hidden className="fill-sun-500 text-sun-500" />
      {rating.toFixed(1)}
      <span className={cn("font-normal", dark ? "text-white/60" : "text-ink-400")}>({count})</span>
    </span>
  );
}

export function SectionHeading({ eyebrow, title, children, align = "left", dark, className, as: H = "h2" }) {
  return (
    <div className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-3xl", className)}>
      {eyebrow && <p className={cn("eyebrow mb-3", dark ? "text-glow" : "text-brand-700")}>{eyebrow}</p>}
      <H className={cn("text-3xl font-bold leading-[1.1] sm:text-4xl md:text-[2.75rem]", dark ? "text-white" : "text-ink-900")}>{title}</H>
      {children && <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-ink-300" : "text-ink-500")}>{children}</p>}
    </div>
  );
}

export function Breadcrumbs({ items, dark }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1 text-sm", dark ? "text-ink-300" : "text-ink-500")}>
      {items.map((it, i) => (
        <span key={it.label} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} aria-hidden className="opacity-60" />}
          {it.href ? (
            <Link href={it.href} className={cn("hover:underline", dark ? "hover:text-white" : "hover:text-ink-900")}>
              {it.label}
            </Link>
          ) : (
            <span className={dark ? "text-white" : "text-ink-900"} aria-current="page">
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ eyebrow, title, description, breadcrumbs, actions, children, dark = true }) {
  return (
    <section className={cn("relative overflow-hidden", dark ? "hero-night text-white" : "border-b border-line bg-white")}>
      {dark && <div aria-hidden className="grid-fade pointer-events-none absolute inset-0" />}
      <div className="container-wc relative pt-32 pb-14 md:pt-36 md:pb-16">
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} dark={dark} />
          </div>
        )}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-3xl">
            {eyebrow && <p className={cn("eyebrow mb-3", dark ? "text-glow" : "text-brand-700")}>{eyebrow}</p>}
            <h1 className={cn("text-4xl font-bold leading-[1.05] md:text-5xl", dark ? "text-white" : "text-ink-900")}>{title}</h1>
            {description && <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-ink-300" : "text-ink-500")}>{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3 md:shrink-0">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={22} aria-hidden />
        </span>
      )}
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      {children && <p className="mt-1.5 max-w-md text-sm text-ink-500">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon, tone = "brand" }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && (
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", tone === "sun" ? "bg-sun-50 text-sun-700" : tone === "coral" ? "bg-coral-50 text-coral-700" : "bg-brand-50 text-brand-700")}>
            <Icon size={16} aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

// Generated cover for hospitals without a photo: gradient + abstract skyline,
// deterministic per hospital so it never changes between renders.
export function HospitalCover({ hospital, className, sizes = "(max-width: 768px) 100vw, 400px", priority }) {
  if (hospital.image) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-100", className)}>
        <Image src={hospital.image} alt={`${hospital.name} building`} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const seed = hashString(hospital.name);
  const hues = [
    ["#0b2545", "#0e8f82"],
    ["#12345c", "#3b82c4"],
    ["#0b2545", "#7c5cd6"],
    ["#14365e", "#e8713c"],
    ["#062033", "#23b3a2"],
  ][seed % 5];
  const towers = Array.from({ length: 11 }).map((_, i) => {
    const r = (seed >> (i % 16)) & 0xff;
    const h = 40 + (r % 70);
    const w = 22 + ((r >> 3) % 22);
    return { x: i * 38 - 10, w, h };
  });
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: `linear-gradient(135deg, ${hues[0]}, ${hues[1]})` }}>
      <svg aria-hidden viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`g${seed}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <circle cx={300 - (seed % 120)} cy={70} r={60} fill="#fff" opacity="0.07" />
        {towers.map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={240 - t.h - 30} width={t.w} height={t.h + 30} rx="3" fill={`url(#g${seed})`} />
            {Array.from({ length: Math.floor(t.h / 14) }).map((_, j) => (
              <rect key={j} x={t.x + 5} y={240 - t.h - 22 + j * 14} width={t.w - 10} height="3" rx="1.5" fill="#fff" opacity="0.12" />
            ))}
          </g>
        ))}
        <rect x="0" y="228" width="400" height="12" fill="#fff" opacity="0.08" />
      </svg>
      <div className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 font-display text-base font-bold text-white ring-1 ring-white/25 backdrop-blur">
        {initials(hospital.name)}
      </div>
    </div>
  );
}

export function ProgressRail({ steps, current, compact }) {
  const idx = steps.indexOf(current);
  return (
    <ol className="flex w-full items-center" aria-label="Case progress">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
            <span className="group relative flex flex-col items-center">
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition",
                  compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
                  done ? "bg-brand-600" : active ? "bg-brand-500 ring-4 ring-brand-500/20" : "bg-ink-200"
                )}
              />
              {!compact && (
                <span className={cn("absolute top-6 hidden w-24 text-center text-[11px] leading-tight lg:block", active ? "font-semibold text-ink-900" : "text-ink-400")}>{s}</span>
              )}
            </span>
            {i < steps.length - 1 && <span className={cn("mx-1 h-0.5 flex-1 rounded-full", i < idx ? "bg-brand-600" : "bg-ink-200")} />}
          </li>
        );
      })}
    </ol>
  );
}

export function formatDate(d, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!d) return "—";
  const date = typeof d === "string" && d.length === 10 ? new Date(`${d}T12:00:00Z`) : new Date(d);
  return date.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}

export function timeAgo(d) {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(d);
}
