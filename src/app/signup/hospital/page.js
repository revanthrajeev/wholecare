import { KanbanSquare, ReceiptText, BadgeCheck, BarChart3 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import HospitalSignupForm from "@/components/HospitalSignupForm";

export const metadata = { title: "List your hospital", robots: { index: false } };

export default function HospitalSignupPage() {
  return (
    <AuthShell
      title="List your hospital"
      subtitle="Create your portal account. You can start setting up straight away — your profile goes live after verification."
      side={{
        title: "Qualified international cases, with complete records.",
        points: [
          [KanbanSquare, "A pipeline for every inbound case"],
          [ReceiptText, "Itemized quotes patients can trust"],
          [BadgeCheck, "A verified public profile"],
          [BarChart3, "Response-time and conversion analytics"],
        ],
      }}
    >
      <HospitalSignupForm />
    </AuthShell>
  );
}
