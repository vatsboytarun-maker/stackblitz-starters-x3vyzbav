"use client";

import { useState } from "react";

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

type Quote = {
  id: string;
  requirement_id: string;
  price: number;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function BuyerDashboardClient({
  requirements,
  quotes,
}: {
  requirements: Requirement[];
  quotes: Quote[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const quotesByReq = quotes.reduce((acc, q) => {
    if (!acc[q.requirement_id]) acc[q.requirement_id] = [];
    acc[q.requirement_id].push(q);
    return acc;
  }, {} as Record<string, Quote[]>);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-brand-dark">
            My Requirements
          </h1>
          <a
            href="/buyer/new"
            className="text-sm px-4 py-2 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-dark transition"
          >
            + New RFQ
          </a>
        </div>

        {requirements.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-4">
              You haven&apos;t submitted any requirements yet.
            </p>
            <a
              href="/buyer/new"
              className="inline-block px-6 py-3 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-dark transition"
            >
              Submit your first requirement
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {requirements.map((r) => {
              const reqQuotes = quotesByReq[r.id] || [];
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className="bg-white border rounded-lg p-4">
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div>
                      <p className="font-medium text-brand-dark">
                        {r.sub_category || r.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {r.quantity} {r.unit} · {r.delivery_location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-teal/10 text-brand-teal">
                        {reqQuotes.length} quotes
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-green/10 text-brand-green">
                        {r.status}
                      </span>
                    </div>
                  </div>

                  {r.specs && r.specs.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Specs: {r.specs.join(", ")}
                    </p>
                  )}

                  {isOpen && (
                    <div className="mt-4 border-t pt-4">
                      {reqQuotes.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          No quotes received yet. Vendors will respond soon.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {reqQuotes.map((q) => (
                            <div
                              key={q.id}
                              className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                            >
                              <div>
                                <p className="font-semibold text-brand-dark">
                                  ₹{q.price.toLocaleString("en-IN")}
                                </p>
                                {q.notes && (
                                  <p className="text-xs text-gray-500">
                                    {q.notes}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(q.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
