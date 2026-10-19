import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user && !sp?.next) redirect(user.role === "hospital" ? `/hospital/${user.hospitalId}` : user.role === "patient" ? "/dashboard" : "/admin");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your case room, hospital portal or operations console.">
      <LoginForm next={sp?.next || ""} />
    </AuthShell>
  );
}
