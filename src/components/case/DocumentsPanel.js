"use client";
import { useRef, useState } from "react";
import { FileText, FileImage, Download, Trash2, UploadCloud, Lock } from "lucide-react";
import { Select, EmptyState, formatDate, cn } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";
import { FILE_CATEGORIES, MAX_UPLOAD_BYTES } from "@/lib/constants";

const LABEL = Object.fromEntries(FILE_CATEGORIES.map((c) => [c.id, c.label]));
const size = (b) => (!b ? "" : b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function DocumentsPanel({ caseId, files, meId, onChange, canUpload = true, hint }) {
  const { toast } = useToast();
  const input = useRef(null);
  const [category, setCategory] = useState("report");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(list) {
    const arr = Array.from(list || []);
    if (!arr.length) return;
    const tooBig = arr.find((f) => f.size > MAX_UPLOAD_BYTES);
    if (tooBig) return toast(`${tooBig.name} is larger than 15 MB.`, "error");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("category", category);
      arr.slice(0, 10).forEach((f) => fd.append("files", f));
      await api(`/api/cases/${caseId}/files`, { method: "POST", form: fd });
      toast(`${arr.length} file${arr.length > 1 ? "s" : ""} uploaded`);
      onChange?.();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(f) {
    if (!confirm(`Remove ${f.name}?`)) return;
    try {
      await api(`/api/files/${f.id}`, { method: "DELETE" });
      toast("Document removed");
      onChange?.();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  return (
    <div className="space-y-5">
      {canUpload && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            upload(e.dataTransfer.files);
          }}
          className={cn("flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed p-6 text-center transition sm:flex-row sm:text-left", drag ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white")}
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <UploadCloud size={22} aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-ink-900">{busy ? "Uploading…" : "Add documents"}</p>
            <p className="text-sm text-ink-500">{hint || "Drop files here — PDF, images, DICOM or Word, up to 15 MB each."}</p>
          </div>
          <div className="flex gap-2">
            <Select aria-label="Document type" value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 w-44 py-0 text-sm">
              {FILE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
            <button disabled={busy} onClick={() => input.current?.click()} className="h-11 rounded-full bg-ink-900 px-5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-50">
              Browse
            </button>
            <input ref={input} type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.dcm,.doc,.docx" onChange={(e) => upload(e.target.files)} />
          </div>
        </div>
      )}
      {files.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet">
          Reports, imaging and lab results help hospitals give an accurate quote.
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-line">
          {files
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((f) => {
              const Icon = f.type?.startsWith("image/") ? FileImage : FileText;
              return (
                <li key={f.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-600">
                    <Icon size={18} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={`/api/files/${f.id}`} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                      {f.name}
                    </a>
                    <p className="text-xs text-ink-400">
                      {LABEL[f.category] || "Document"} · {size(f.size)} · {f.uploaderRole === "hospital" ? "from hospital" : "you"} · {formatDate(f.createdAt)}
                    </p>
                  </div>
                  <a href={`/api/files/${f.id}`} download className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-800" aria-label={`Download ${f.name}`}>
                    <Download size={17} />
                  </a>
                  {f.uploadedBy === meId && (
                    <button onClick={() => remove(f)} className="rounded-lg p-2 text-ink-400 hover:bg-[#fdecef] hover:text-rose-600" aria-label={`Remove ${f.name}`}>
                      <Trash2 size={17} />
                    </button>
                  )}
                </li>
              );
            })}
        </ul>
      )}
      <p className="flex items-center gap-2 text-xs text-ink-400">
        <Lock size={13} aria-hidden /> Downloads by hospitals and staff are recorded in the case access log.
      </p>
    </div>
  );
}
