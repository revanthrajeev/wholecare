import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/core";
import AccountSettings from "@/components/AccountSettings";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account settings", robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings & privacy" breadcrumbs={[{ label: "Dashboard", href: user.role === "patient" ? "/dashboard" : "/" }, { label: "Account" }]} />
      <section className="container-wc max-w-3xl py-10">
        <AccountSettings user={user} />
      </section>
    </>
  );
}
