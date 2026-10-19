"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, KeyRound, UserRound } from "lucide-react";
import { Button, Field, Input, Select, FormError, buttonClass } from "@/components/ui/core";
import { Modal, api, useToast } from "@/components/ui/client";
import { COUNTRIES } from "@/components/SignupForm";

export default function AccountSettings({ user }) {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ name: user.name || "", phone: user.phone || "", country: user.country || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [del, setDel] = useState({ open: false, password: "", error: "" });
  const [busy, setBusy] = useState(false);

  async function save(body, msg, reset) {
    setBusy(true);
    try {
      await api("/api/account", { method: "PATCH", body });
      toast(msg);
      reset?.();
      router.refresh();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await api("/api/account", { method: "DELETE", body: { password: del.password } });
      router.push("/");
      router.refresh();
    } catch (e) {
      setDel((d) => ({ ...d, error: e.message }));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="card p-6">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <UserRound size={18} className="text-brand-600" aria-hidden /> Profile
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="a-name">
            <Input id="a-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </Field>
          <Field label="Email" htmlFor="a-email" hint="contact us to change">
            <Input id="a-email" value={user.email} disabled />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="a-phone" optional>
            <Input id="a-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </Field>
          <Field label="Country" htmlFor="a-country" optional>
            <Select id="a-country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}>
              <option value="">Select…</option>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Button className="mt-5" disabled={busy} onClick={() => save(profile, "Profile saved")}>
          Save profile
        </Button>
      </section>

      <section className="card p-6">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <KeyRound size={18} className="text-brand-600" aria-hidden /> Password
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current password" htmlFor="a-cur">
            <Input id="a-cur" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" htmlFor="a-new" hint="8+ characters">
            <Input id="a-new" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
        </div>
        <Button className="mt-5" variant="outline" disabled={busy || !pw.currentPassword || pw.newPassword.length < 8} onClick={() => save(pw, "Password changed", () => setPw({ currentPassword: "", newPassword: "" }))}>
          Change password
        </Button>
      </section>

      {user.role === "patient" && (
        <section className="card p-6">
          <p className="font-bold text-ink-900">Your data</p>
          <p className="mt-1 text-sm text-ink-500">Download everything we hold about you, or delete your account and all your cases.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/api/account/export" className={buttonClass({ variant: "outline" })}>
              <Download size={16} aria-hidden /> Download my data
            </a>
            <Button variant="ghost" className="text-rose-600 hover:bg-[#fdecef]" onClick={() => setDel({ open: true, password: "", error: "" })}>
              <Trash2 size={16} aria-hidden /> Delete account
            </Button>
          </div>
        </section>
      )}

      <Modal open={del.open} onClose={() => setDel({ ...del, open: false })} title="Delete your account?">
        <div className="space-y-4">
          <p className="text-sm text-ink-600">This permanently removes your cases, documents, messages and consultations from Whole Care. Hospitals may keep their own medical records as the law requires. This can&rsquo;t be undone.</p>
          <Field label="Confirm with your password" htmlFor="d-pw">
            <Input id="d-pw" type="password" value={del.password} onChange={(e) => setDel({ ...del, password: e.target.value, error: "" })} />
          </Field>
          <FormError>{del.error}</FormError>
          <Button variant="danger" className="w-full" disabled={busy || !del.password} onClick={remove}>
            Permanently delete my account
          </Button>
        </div>
      </Modal>
    </div>
  );
}
