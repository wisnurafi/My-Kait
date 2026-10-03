import type { Metadata } from "next";

/**
 * Admin area root layout — no guard here (the login page lives inside),
 * just keeps crawlers out. Guarding happens in middleware and in
 * (panel)/layout.tsx (defense in depth).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
