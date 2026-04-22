import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ReferralCapture } from "./ReferralCapture";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  slug: string;
  is_active: boolean;
}

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data ?? [];
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-card-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              Digital Guides &amp; Ebooks
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Master Your Money.
              <br />
              <span className="text-accent">Build Real Wealth.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Premium business and money guides written by practitioners, not
              theorists. Actionable strategies you can implement today to grow
              your income and build lasting wealth.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="#products"
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent-hover"
              >
                Browse Guides
              </a>
              <Link
                href="/affiliate"
                className="rounded-lg border border-card-border px-6 py-3 font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                Earn 20% Commission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Our Guides
        </h2>
        <p className="mb-10 text-muted">
          Each guide is instantly delivered as a digital download after purchase.
        </p>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-card-border py-20 text-center text-muted">
            <p className="text-lg">No products available yet.</p>
            <p className="mt-1 text-sm">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex flex-col rounded-xl border border-card-border bg-card-bg transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="flex h-48 items-center justify-center rounded-t-xl bg-gradient-to-br from-accent/10 to-accent/5">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full rounded-t-xl object-cover"
                    />
                  ) : (
                    <div className="text-5xl">📘</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-accent">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    <span className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-semibold text-accent group-hover:bg-accent group-hover:text-black transition-colors">
                      Buy Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
