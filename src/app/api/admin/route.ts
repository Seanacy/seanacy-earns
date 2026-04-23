import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

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

    if (type === "assignments") {
      const { data, error } = await supabase
        .from("affiliate_products")
        .select("*, affiliates(name), products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "referrals") {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create new records
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, ...record } = body;

  try {
    if (type === "affiliate") {
      const { data, error } = await supabase
        .from("affiliates")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "coupon") {
      const { data, error } = await supabase
        .from("coupons")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === "assignment") {
      const { data, error } = await supabase
        .from("affiliate_products")
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Update existing records
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, id, ...updates } = body;

  try {
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

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove records
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  try {
    if (type === "affiliate") {
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (type === "coupon") {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (type === "assignment") {
      const { error } = await supabase.from("affiliate_products").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
