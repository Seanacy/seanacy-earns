import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "seanacy2024";

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

// GET: Fetch all data for admin dashboard
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "affiliates") {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "coupons") {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "products") {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "affiliate_products") {
      const { data, error } = await supabase
        .from("affiliate_products")
        .select("*, affiliates(name, email), products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "referrals") {
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*, affiliates(name, email), orders(amount, status)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Admin GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new affiliate, coupon, or affiliate_product assignment
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, ...payload } = body;

    if (type === "affiliate") {
      const { data, error } = await supabase
        .from("affiliates")
        .insert({
          name: payload.name,
          email: payload.email,
          referral_code: payload.referral_code,
          coupon_code: payload.coupon_code || null,
          commission_rate: payload.commission_rate ?? 0.2,
          discount_percent: payload.discount_percent ?? 0,
          total_earnings: 0,
          total_paid: 0,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "coupon") {
      const { data, error } = await supabase
        .from("coupons")
        .insert({
          code: payload.code,
          discount_percent: payload.discount_percent ?? 10,
          is_active: true,
          max_uses: payload.max_uses || null,
          times_used: 0,
          expires_at: payload.expires_at || null,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "product") {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: payload.name,
          slug: payload.slug,
          description: payload.description || "",
          price: payload.price,
          stripe_price_id: payload.stripe_price_id || null,
          download_url: payload.download_url || null,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "affiliate_product") {
      const { data, error } = await supabase
        .from("affiliate_products")
        .insert({
          affiliate_id: payload.affiliate_id,
          product_id: payload.product_id,
          custom_commission_rate: payload.custom_commission_rate || null,
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Admin POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update affiliate or coupon
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, id, ...updates } = body;

    if (type === "affiliate") {
      const { data, error } = await supabase
        .from("affiliates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "product") {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "coupon") {
      const { data, error } = await supabase
        .from("coupons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Admin PUT error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove affiliate_product assignment
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (type === "affiliate_product") {
      const { error } = await supabase
        .from("affiliate_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Admin DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
