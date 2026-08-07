"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubmitQuoteButton({
  requirementId,
  vendorId,
}: {
  requirementId: string;
  vendorId: string;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submitQuote() {
    setError("");
    setLoading(true);
    const { error: insertError } = await supabase.from("quotes").insert({
      requirement_id: requirementId,
      vendor_id: vendorId,
      price: Number(price),
      notes: notes || null,
      status: "submitted",
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSubmitted(true);
    setOpen(false);
  }

  if (submitted) {
    return (
      <span className="text-sm text-brand-green font-medium">
        ✓ Quote submitted
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm px-4 py-2 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-dark transition"
      >
        Submit Quote
      </button>

      {open && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Your price (₹)"
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for the buyer (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
          />
          <button
            onClick={submitQuote}
            disabled={!price || loading}
            className="w-full py-2 rounded-lg bg-brand-green text-white font-medium disabled:opacity-50 hover:bg-brand-dark transition"
          >
            {loading ? "Submitting..." : "Submit Quote"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
