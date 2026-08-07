import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRIDGE — B2B Procurement Marketplace",
  description: "Connecting Buyers and Vendors on one trusted platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}