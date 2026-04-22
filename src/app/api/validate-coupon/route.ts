import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false });
    }

    // Check affiliate coupon codes first
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("coupon_code, discount_percent")
      .eq("coupon_code", code)
      .eq("is_active", true)
      .single();

    if (affiliate) {
      return NextResponse.json({
        valid: true,
        discount_percent: affiliate.discount_percent ?? 0,
        type: "affiliate",
      });
    }

    // Check standalone coupons
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (coupon) {
      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json({ valid: false });
      }
      // Check max uses
      if (coupon.max_uses && coupon.times_used >= coupon.max_uses) {
        return NextResponse.json({ valid: false });
      }

      return NextResponse.json({
        valid: true,
        discount_percent: coupon.discount_percent,
        type: "coupon",
      });
    }

    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
