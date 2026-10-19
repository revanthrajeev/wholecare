import { Clock, MessageCircle, Mail, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/core";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact a care coordinator", description: "Talk to a Whole Care coordinator about treatment abroad, hospital partnerships or anything else." };

export default async function ContactPage({ searchParams }) {
  const sp = await searchParams;
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <>
      <PageHeader eyebrow="Contact" title="Talk to a care coordinator" description="Real people who help you plan — from choosing a destination to arranging follow-up at home." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      <section className="container-wc grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm initialTopic={sp?.topic === "partnership" ? "partnership" : "patient"} />
        <aside className="space-y-4">
          <div className="card p-6">
            <Clock size={20} className="text-brand-600" aria-hidden />
            <p className="mt-3 font-bold text-ink-900">Response time</p>
            <p className="mt-1 text-sm text-ink-500">We reply to every message within one working day.</p>
          </div>
          <div className="card p-6">
            <Sparkles size={20} className="text-brand-600" aria-hidden />
            <p className="mt-3 font-bold text-ink-900">Quick questions?</p>
            <p className="mt-1 text-sm text-ink-500">The assistant in the corner answers questions about prices, destinations and visas instantly.</p>
          </div>
          {(whatsapp || email) && (
            <div className="card space-y-3 p-6">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-semibold text-ink-900 hover:text-brand-700">
                  <MessageCircle size={18} className="text-brand-600" aria-hidden /> WhatsApp us
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 font-semibold text-ink-900 hover:text-brand-700">
                  <Mail size={18} className="text-brand-600" aria-hidden /> {email}
                </a>
              )}
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
