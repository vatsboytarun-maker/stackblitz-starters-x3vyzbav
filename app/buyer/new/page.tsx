"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Office Furniture",
  "IT & Electronics",
  "Machinery & Equipment",
  "Building & Construction",
  "Raw Materials",
  "Other Products",
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "Office Furniture": [
    "Office Chair",
    "Office Table / Desk",
    "Conference Table",
    "Workstation",
    "Filing Cabinet",
    "Sofa / Lounge Chair",
    "Other",
  ],
  "IT & Electronics": [
    "Laptops & Desktops",
    "Networking Equipment",
    "Printers & Scanners",
    "Servers & Storage",
    "Other",
  ],
  "Machinery & Equipment": [
    "Industrial Machinery",
    "Construction Equipment",
    "Material Handling",
    "Power Tools",
    "Other",
  ],
  "Building & Construction": [
    "Cement & Concrete",
    "Steel & Metals",
    "Bricks & Blocks",
    "Electrical & Lighting",
    "Plumbing & Sanitary",
    "Other",
  ],
  "Raw Materials": [
    "Metals & Alloys",
    "Plastics & Polymers",
    "Chemicals",
    "Wood & Timber",
    "Other",
  ],
  "Other Products": ["General Products", "Other"],
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function BuyerWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BuyerWizardInner />
    </Suspense>
  );
}

function BuyerWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isService = searchParams.get("type") === "service";
  const heading = isService
    ? "What service are you looking for?"
    : "What product are you looking for?";

  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("nos");
  const [location, setLocation] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [specs, setSpecs] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addSpec() {
    if (specInput.trim()) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput("");
    }
  }
  function removeSpec(s: string) {
    setSpecs(specs.filter((x) => x !== s));
  }

  async function submitRfq() {
    setError("");
    setLoading(true);

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    let userId: string | null = null;

    if (signInError) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/buyer/dashboard`,
          },
        });
      if (signUpError || !signUpData.user) {
        setLoading(false);
        setError(signUpError?.message || "Sign up failed");
        return;
      }
      userId = signUpData.user.id;
    } else {
      userId = signInData.user?.id ?? null;
    }

    if (!userId) {
      setLoading(false);
      setError("Authentication failed");
      return;
    }

    await supabase.from("profiles").upsert({
      id: userId,
      is_buyer: true,
    });

    const { error: insertError } = await supabase.from("requirements").insert({
      buyer_id: userId,
      category,
      sub_category: subCategory,
      quantity: Number(quantity) || null,
      unit,
      delivery_location: location,
      required_by: requiredBy || null,
      specs,
      status: "active",
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/buyer/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg">
        <StepIndicator step={step} />

        <div className="bg-white rounded-xl border shadow-sm p-6 mt-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-dark mb-1">
                {heading}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Please select the closest category
              </p>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                      category === c
                        ? "border-brand-teal bg-brand-teal/5 font-medium"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <NavButtons
                onNext={() => setStep(2)}
                nextDisabled={!category}
                showBack={false}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-dark mb-1">
                {category}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                What exactly do you need?
              </p>
              <div className="space-y-2">
                {(SUB_CATEGORIES[category] || ["General " + category]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setSubCategory(s)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                        subCategory === s
                          ? "border-brand-teal bg-brand-teal/5 font-medium"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
              <NavButtons
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                nextDisabled={!subCategory}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-dark mb-4">
                How many {subCategory} do you need?
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="nos">nos</option>
                  <option value="kg">kg</option>
                  <option value="units">units</option>
                  <option value="sets">sets</option>
                </select>
              </div>

              <label className="text-sm font-medium text-gray-700">
                Where should it be delivered?
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Gurgaon, Haryana"
                className="w-full border rounded-lg px-3 py-2 mt-1 mb-4"
              />

              <label className="text-sm font-medium text-gray-700">
                Required by (optional)
              </label>
              <input
                type="date"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />

              <NavButtons
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                nextDisabled={!quantity || !location}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-dark mb-4">
                Any specific requirements?
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {specs.map((s) => (
                  <span
                    key={s}
                    className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {s}
                    <button
                      onClick={() => removeSpec(s)}
                      className="ml-1 hover:text-brand-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specInput}
                  onChange={(e) => setSpecInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSpec()}
                  placeholder="e.g. Ergonomic, Mesh Back"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  onClick={addSpec}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  + Add
                </button>
              </div>

              <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-brand-green flex items-center justify-center text-white text-2xl mb-3">
                  ✓
                </div>
                <h2 className="text-lg font-semibold text-brand-dark">
                  Great! Your requirement is ready.
                </h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <p>
                  <b>Product:</b> {subCategory}
                </p>
                <p>
                  <b>Quantity:</b> {quantity} {unit}
                </p>
                <p>
                  <b>Delivery Location:</b> {location}
                </p>
                {requiredBy && (
                  <p>
                    <b>Required By:</b> {requiredBy}
                  </p>
                )}
                {specs.length > 0 && (
                  <p>
                    <b>Key Requirements:</b> {specs.join(", ")}
                  </p>
                )}
              </div>
              <NavButtons
                onBack={() => setStep(4)}
                onNext={() => setStep(6)}
                nextLabel="Continue to get quotations"
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-lg font-semibold text-brand-dark mb-1">
                Continue to get quotations
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Sign in or create an account with your email to submit your
                request.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border rounded-lg px-3 py-2 mb-3"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border rounded-lg px-3 py-2 mb-3"
              />
              <button
                onClick={submitRfq}
                disabled={!email || !password || loading}
                className="w-full py-3 rounded-lg bg-brand-teal text-white font-medium disabled:opacity-50 hover:bg-brand-dark transition"
              >
                {loading ? "Submitting..." : "Submit RFQ"}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                New here? Just enter your email and a password — we&apos;ll
                create your account automatically.
              </p>

              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

              <NavButtons onBack={() => setStep(5)} hideNext />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const labels = [
    "Category",
    "Details",
    "Quantity",
    "Specs",
    "Summary",
    "Login",
  ];
  return (
    <div className="flex justify-between text-xs text-gray-400">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 transition ${
                active
                  ? "bg-brand-teal text-white"
                  : done
                  ? "bg-brand-green text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={active ? "text-brand-teal font-medium" : ""}>
              {l}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  showBack = true,
  hideNext = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
  hideNext?: boolean;
}) {
  return (
    <div className="flex justify-between mt-6">
      {showBack ? (
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Back
        </button>
      ) : (
        <div />
      )}
      {!hideNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-6 py-2 rounded-lg bg-brand-teal text-white font-medium disabled:opacity-40 hover:bg-brand-dark transition"
        >
          {nextLabel || "Next"}
        </button>
      )}
    </div>
  );
}
