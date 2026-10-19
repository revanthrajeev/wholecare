import { redirect } from "next/navigation";

export default async function CompareRedirect({ params }) {
  const { id } = await params;
  redirect(`/case/${id}?tab=quotes`);
}
