import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { productId, referralCode, couponCode } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fetch product from Supabase
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Build metadata
    const metadata: Record<string, string> = {
      product_id: product.id,
      product_name: product.name,
    };

    if (referralCode) {
      metadata.referral_code = referralCode;
    }

    let finalPrice = product.price; // price in cents

    // Handle coupon/discount code
    if (couponCode) {
      metadata.coupon_code = couponCode;

      // Check affiliate coupon codes
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("referral_code, discount_percent")
        .eq("coupon_code", couponCode)
        .eq("is_active", true)
        .single();

      if (affiliate) {
        const discount = affiliate.discount_percent ?? 0;
        if (discount > 0) {
          finalPrice = Math.round(product.price * (1 - discount / 100));
        }
        // Store the affiliate's referral_code so webhook can credit them
        metadata.referral_code = affiliate.referral_code;
      } else {
        // Check standalone coupons
        const { data: coupon } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", couponCode)
          .eq("is_active", true)
          .single();

        if (coupon) {
          const isExpired =
            coupon.expires_at && new Date(coupon.expires_at) < new Date();
          const isMaxed =
            coupon.max_uses && coupon.times_used >= coupon.max_uses;

          if (!isExpired && !isMaxed) {
            const discount = coupon.discount_percent ?? 0;
            if (discount > 0) {
              finalPrice = Math.round(product.price * (1 - discount / 100));
            }
            // Increment times_used
            await supabase
              .from("coupons")
              .update({ times_used: (coupon.times_used ?? 0) + 1 })
              .eq("id", coupon.id);
          }
        }
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
