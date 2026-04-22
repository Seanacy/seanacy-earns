import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      console.error("Error handling checkout:", err);
      return NextResponse.json(
        { error: "Webhook handler error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const productId = session.metadata?.product_id;
  const referralCode = session.metadata?.referral_code;
  const customerEmail = session.customer_details?.email;
  const amount = session.amount_total ?? 0;

  if (!productId) {
    console.error("No product_id in session metadata");
    return;
  }

  // Upsert customer
  let customerId: string | null = null;
  if (customerEmail) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          email: customerEmail,
          name: session.customer_details?.name || "",
          stripe_customer_id: session.customer as string | null,
        })
        .select("id")
        .single();

      customerId = newCustomer?.id ?? null;
    }
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      product_id: productId,
      amount,
      stripe_payment_intent_id: session.payment_intent as string | null,
      stripe_checkout_session_id: session.id,
      status: "completed",
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    return;
  }

  // Handle affiliate referral
  if (referralCode && order) {
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, commission_rate, total_earnings")
      .eq("referral_code", referralCode)
      .eq("is_active", true)
      .single();

    if (affiliate) {
      const commissionRate = affiliate.commission_rate ?? 0.2;
      const commissionAmount = Math.round(amount * commissionRate);

      // Create affiliate referral record
      await supabase.from("affiliate_referrals").insert({
        affiliate_id: affiliate.id,
        order_id: order.id,
        commission_amount: commissionAmount,
        status: "pending",
      });

      // Update affiliate total earnings
      await supabase
        .from("affiliates")
        .update({
          total_earnings: (affiliate.total_earnings ?? 0) + commissionAmount,
        })
        .eq("id", affiliate.id);
    }
  }
}
