"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button, Textarea, FormError, cn } from "@/components/ui/core";
import { api, useToast } from "@/components/ui/client";

export default function ReviewForm({ hospitalId, caseId, procedure }) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Choose a star rating.");
    if (text.trim().length < 20) return setError("Please write at least a couple of sentences (20+ characters).");
    setBusy(true);
    try {
      await api("/api/reviews", { method: "POST", body: { hospitalId, caseId, rating, text } });
      toast("Thank you — your verified review is live.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <p className="font-bold text-ink-900">Review your experience</p>
        <p className="text-sm text-ink-500">You&rsquo;re eligible because your case for {procedure} is complete. Your review will show a &ldquo;Verified patient&rdquo; badge.</p>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="rounded-lg p-1 transition hover:scale-110"
          >
            <Star size={28} className={cn((hover || rating) >= n ? "fill-sun-500 text-sun-500" : "fill-ink-100 text-ink-200")} aria-hidden />
          </button>
        ))}
      </div>
      <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} maxLength={1200} placeholder="What went well? What could be better? Other patients will read this." aria-label="Your review" />
      <FormError>{error}</FormError>
      <Button type="submit" disabled={busy}>
        {busy ? "Posting…" : "Post verified review"}
      </Button>
    </form>
  );
}
