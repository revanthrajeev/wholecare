import AuthShell from "@/components/AuthShell";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Create your account", robots: { index: false } };

export default async function SignupPage({ searchParams }) {
  const sp = await searchParams;
  return (
    <AuthShell title="Create your free account" subtitle="Request quotes, book consults and keep your whole journey in one case room.">
      <SignupForm next={sp?.next || ""} />
    </AuthShell>
  );
}
