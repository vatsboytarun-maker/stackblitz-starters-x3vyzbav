import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-semibold text-brand-dark">BRIDGE</span>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/vendor/login"
            className="px-4 py-2 rounded-md border border-brand-teal text-brand-teal hover:bg-brand-teal/5"
          >
            Vendor Sign In
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-3">
            Find the right vendors. Compare. Connect. Save time.
          </h1>
          <p className="text-gray-500 mb-8">
            Describe your requirement in simple words. We&apos;ll match you
            with verified vendors — no login required to get started.
          </p>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Link
              href="/buyer/new"
              className="w-full py-3 rounded-lg bg-brand-teal text-white font-medium hover:bg-brand-dark transition"
            >
              I need a Product
            </Link>
            <Link
              href="/buyer/new?type=service"
              className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              I need a Service
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            No login required to get started
          </p>
        </div>
      </section>
    </main>
  );
}