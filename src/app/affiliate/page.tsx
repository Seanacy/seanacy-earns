"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AffiliateData {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  total_earnings: number;
  total_paid: number;
}

function generateReferralCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${slug}${rand}`;
}

export default function AffiliatePage() {
  const [mode, setMode] = useState<"signup" | "dashboard">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check if affiliate already exists
      const { data: existing } = await supabase
        .from("affiliates")
        .select("*")
        .eq("email", email)
        .single();

      if (existing) {
        setAffiliate(existing as AffiliateData);
        setSuccess("Welcome back! Here is your affiliate dashboard.");
        setLoading(false);
        return;
      }

      const referralCode = generateReferralCode(name);

      const { data, error: insertError } = await supabase
        .from("affiliates")
        .insert({
          name,
          email,
          referral_code: referralCode,
          commission_rate: 0.2,
          total_earnings: 0,
          total_paid: 0,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        setError("Something went wrong. Please try again.");
        console.error(insertError);
      } else {
        setAffiliate(data as AffiliateData);
        setSuccess(
          "You are now an affiliate! Share your link to start earning."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: lookupError } = await supabase
        .from("affiliates")
        .select("*")
        .eq("email", lookupEmail)
        .single();

      if (lookupError || !data) {
        setError("No affiliate account found with that email.");
      } else {
        setAffiliate(data as AffiliateData);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const referralLink = affiliate
    ? `${siteUrl}/?ref=${affiliate.referral_code}`
    : "";

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Affiliate Program
      </h1>
      <p className="mt-3 text-lg text-muted">
        Earn <span className="font-bold text-accent">20% commission</span> on
        every sale you refer. Share your unique link and get paid.
      </p>

      {/* Affiliate Dashboard */}
      {affiliate && (
        <div className="mt-10 rounded-xl border border-card-border bg-card-bg p-6">
          {success && (
            <div className="mb-4 rounded-lg bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
              {success}
            </div>
          )}

          <h2 className="text-xl font-bold">Your Dashboard</h2>
          <p className="mt-1 text-sm text-muted">
            Welcome, {affiliate.name}!
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-card-border bg-background p-4 text-center">
              <div className="text-2xl font-extrabold text-accent">
                ${((affiliate.total_earnings ?? 0) / 100).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-muted">Total Earnings</div>
            </div>
            <div className="rounded-lg border border-card-border bg-background p-4 text-center">
              <div className="text-2xl font-extrabold text-accent">
                ${((affiliate.total_paid ?? 0) / 100).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-muted">Total Paid</div>
            </div>
            <div className="rounded-lg border border-card-border bg-background p-4 text-center">
              <div className="text-2xl font-extrabold text-accent">
                $
                {(
                  ((affiliate.total_earnings ?? 0) -
                    (affiliate.total_paid ?? 0)) /
                  100
                ).toFixed(2)}
              </div>
              <div className="mt-1 text-xs text-muted">Balance</div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-muted">
              Your Referral Link
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm text-foreground"
              />
              <button
                onClick={() => navigator.clipboard.writeText(referralLink)}
                className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Referral code:{" "}
              <span className="font-mono text-accent">
                {affiliate.referral_code}
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              setAffiliate(null);
              setSuccess("");
            }}
            className="mt-6 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* Sign Up / Lookup Tabs */}
      {!affiliate && (
        <div className="mt-10">
          <div className="flex border-b border-card-border">
            <button
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                mode === "signup"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setMode("dashboard");
                setError("");
              }}
              className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                mode === "dashboard"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              View Dashboard
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1 w-full rounded-lg border border-card-border bg-card-bg px-4 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-card-border bg-card-bg px-4 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Creating Account..." : "Join Affiliate Program"}
              </button>
              <p className="text-xs text-muted">
                By signing up, you agree to promote Seanacy Earns products
                ethically. Commissions are paid on confirmed sales.
              </p>
            </form>
          )}

          {mode === "dashboard" && (
            <form onSubmit={handleLookup} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted">
                  Your Affiliate Email
                </label>
                <input
                  type="email"
                  required
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-card-border bg-card-bg px-4 py-2.5 text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Looking up..." : "View My Dashboard"}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
