"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function BuyButton({ productId }: { productId: string }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
  }, [searchParams]);

  async function handleCheckout() {
    setLoading(true);
    try {
      const referralCode = localStorage.getItem("referralCode") || undefined;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, referralCode }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-8 w-full rounded-lg bg-accent py-4 text-lg font-bold text-black transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? "Processing..." : "Buy Now"}
    </button>
  );
}
