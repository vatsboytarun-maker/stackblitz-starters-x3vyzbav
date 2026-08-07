"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VendorLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    );

    if (signInError) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/vendor/dashboard`,
          },
        });
      if (signUpError || !signUpData.user) {
        setLoading(false);
        setError(signUpError?.message || "Sign up failed");
        return;
      }
      await supabase.from("profiles").upsert({
        id: signUpData.user.id,
        is_vendor: true,
      });
      setLoading(false);
      router.push("/vendor/dashboard");
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        is_vendor: true,
      });
    }

    setLoading(false);
    router.push("/vendor/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-6">
        <h1 className="text-lg font-semibold text-brand-dark mb-1">
          Vendor Portal
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Sign in or create an account with your email
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
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="w-full py-3 rounded-lg bg-brand-green text-white font-medium disabled:opacity-50 hover:bg-brand-dark transition"
        >
          {loading ? "Please wait..." : "Continue"}
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">
          New vendor? Just enter your email and a password — we&apos;ll create
          your account automatically.
        </p>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-xs text-gray-500 hover:text-brand-teal"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
