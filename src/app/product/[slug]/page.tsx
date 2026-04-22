import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { BuyButton } from "./BuyButton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  slug: string;
}

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Product Image */}
        <div className="flex items-center justify-center rounded-xl border border-card-border bg-gradient-to-br from-accent/10 to-accent/5 aspect-square">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="text-7xl">📘</div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-3 inline-block w-fit rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            Digital Download
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {product.description}
          </p>
          <div className="mt-6 text-4xl font-extrabold text-accent">
            ${(product.price / 100).toFixed(2)}
          </div>

          <Suspense fallback={<div className="mt-8 w-full rounded-lg bg-accent/50 py-4 text-center text-lg font-bold text-black">Loading...</div>}>
            <BuyButton productId={product.id} />
          </Suspense>

          <div className="mt-6 space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Instant digital
              delivery
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Lifetime access
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">&#10003;</span> Actionable
              strategies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
        }
