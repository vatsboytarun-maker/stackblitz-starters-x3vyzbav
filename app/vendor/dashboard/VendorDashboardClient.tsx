"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SubmitQuoteButton from "./SubmitQuoteButton";

const ALL_CATEGORIES = [
  "Office Furniture",
  "IT & Electronics",
  "Machinery & Equipment",
  "Building & Construction",
  "Raw Materials",
  "Other Products",
];

type Capability = { id: string; category: string };

type Requirement = {
  id: string;
  category: string;
  sub_category: string | null;
  quantity: number | null;
  unit: string;
  delivery_location: string | null;
  required_by: string | null;
  specs: string[];
  status: string;
  created_at: string;
};

export default function VendorDashboardClient({
  vendorId,
  capabilities,
  requirements,
  quotedReqIds,
}: {
  vendorId: string;
  capabilities: Capability[];
  requirements: Requirement[];
  quotedReqIds: string[];
}) {
  const supabase = createClient();
  const [caps, setCaps] = useState<Capability[]>(capabilities);
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState("");

  async function addCapability(category: string) {
    if (!category) return;
    const { data, error } = await supabase
      .from("vendor_capability")
      .insert({ vendor_id: vendorId, category })
      .select("id, category")
      .single();
    if (!error && data) {
      setCaps([...caps, data]);
    }
    setNewCat("");
    setAdding(false);
  }

  async function removeCapability(id: string) {
    const { error } = await supabase
      .from("vendor_capability")
      .delete()
      .eq("id", id);
    if (!error) {
      setCaps(caps.filter((c) => c.id !== id));
    }
  }

  const availableToAdd = ALL_CATEGORIES.filter(
    (c) => !caps.some((cap) => cap.category === c)
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-brand-dark">
            Vendor Dashboard
          </h1>
          <a
            href="/"
            className="text-xs text-gray-500 hover:text-brand-teal"
          >
            Home
          </a>
        </div>

        {/* Capabilities section */}
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-brand-dark mb-3">
            Your Capability Categories
          </h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {caps.length === 0 && (
              <p className="text-sm text-gray-400">
                No categories yet. Add categories to start seeing matched
                requirements.
              </p>
            )}
            {caps.map((c) => (
              <span
                key={c.id}
                className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {c.category}
                <button
                  onClick={() => removeCapability(c.id)}
                  className="ml-1 hover:text-brand-dark"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {adding ? (
            <div className="flex gap-2">
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="border rounded-lg px-3 py-2 flex-1"
              >
                <option value="">Select a category...</option>
                {availableToAdd.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => addCapability(newCat)}
                disabled={!newCat}
                className="px-4 py-2 rounded-lg bg-brand-teal text-white text-sm font-medium disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewCat("");
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            availableToAdd.length > 0 && (
              <button
                onClick={() => setAdding(true)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                + Add Category
              </button>
            )
          )}
        </div>

        {/* Matched requirements section */}
        <h2 className="text-sm font-semibold text-brand-dark mb-3">
          Matched Requirements ({requirements.length})
        </h2>

        {requirements.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <p className="text-gray-500">
              No matched requirements yet. Add your capability categories
              above to start seeing matches.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requirements.map((r) => {
              const alreadyQuoted = quotedReqIds.includes(r.id);
              return (
                <div key={r.id} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-brand-dark">
                        {r.sub_category || r.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {r.quantity} {r.unit} · {r.delivery_location}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-teal/10 text-brand-teal">
                      New
                    </span>
                  </div>
                  {r.specs && r.specs.length > 0 && (
                    <p className="text-xs text-gray-500 mb-3">
                      Specs: {r.specs.join(", ")}
                    </p>
                  )}
                  {alreadyQuoted ? (
                    <span className="text-sm text-brand-green font-medium">
                      ✓ Quote submitted
                    </span>
                  ) : (
                    <SubmitQuoteButton
                      requirementId={r.id}
                      vendorId={vendorId}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
