"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function BuyButton({ productId }: { productId: string }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
  }, [searchParams]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponStatus("valid");
        setDiscountPercent(data.discount_percent);
      } else {
        setCouponStatus("invalid");
        setDiscountPercent(0);
      }
    } catch {
      setCouponStatus("invalid");
      setDiscountPercent(0);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const referralCode = localStorage.getItem("referralCode") || undefined;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          referralCode,
          couponCode: couponCode.trim() || undefined,
        }),
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
    <div className="mt-8">
      {/* Coupon Code Input */}
      <div className="mb-4">
        <label className="text-sm font-medium text-muted">
          Have a coupon code?
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponStatus("idle");
            }}
            placeholder="Enter code"
            className="w-full rounded-lg border border-card-border bg-card-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleApplyCoupon}
            className="shrink-0 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
        {couponStatus === "valid" && (
          <p className="mt-1 text-xs text-green-400">
            Coupon applied! {discountPercent}% off
          </p>
        )}
        {couponStatus === "invalid" && (
          <p className="mt-1 text-xs text-red-400">
            Invalid or expired coupon code
          </p>
        )}
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-lg bg-accent py-4 text-lg font-bold text-black transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Processing..." : "Buy Now"}
      </button>
    </div>
  );
}
