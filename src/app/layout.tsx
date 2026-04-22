import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seanacy Earns | Business & Money Ebooks",
  description:
    "Premium digital guides to help you build wealth, grow your business, and master money management.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Seanacy Earns | Business & Money Ebooks",
    description:
      "Premium digital guides to help you build wealth, grow your business, and master money management.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seanacy Earns | Business & Money Ebooks",
    description:
      "Premium digital guides to help you build wealth, grow your business, and master money management.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-1 group">
              <span
                className="text-3xl sm:text-4xl"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                <span className="text-foreground">Seanacy</span>
                <span className="text-accent">Earns</span>
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
