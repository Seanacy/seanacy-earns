import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seanacy Earns | Business & Money Ebooks",
  description:
    "Premium digital guides to help you build wealth, grow your business, and master money management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-accent">$</span> Seanacy Earns
              </span>
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="text-muted hover:text-foreground transition-colors"
              >
                Store
              </Link>
              <Link
                href="/affiliate"
                className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-accent hover:bg-accent/20 transition-colors"
              >
                Become an Affiliate
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-card-border py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted sm:px-6">
            &copy; {new Date().getFullYear()} Seanacy Earns. All rights
            reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
