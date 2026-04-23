"use client";

import { useState, useEffect, useCallback } from "react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  coupon_code: string | null;
  commission_rate: number;
  discount_percent: number;
  total_earnings: number;
  total_paid: number;
  is_active: boolean;
  created_at: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  stripe_price_id: string | null;
  download_url: string | null;
  is_active: boolean;
}

interface AffiliateProduct {
  id: string;
  affiliate_id: string;
  product_id: string;
  custom_commission_rate: number | null;
  affiliates: { name: string; email: string };
  products: { name: string };
}

interface Referral {
  id: string;
  commission_amount: number;
  status: string;
  created_at: string;
  affiliates: { name: string; email: string };
  orders: { amount: number; status: string };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<
    "affiliates" | "coupons" | "products" | "assignments" | "referrals"
  >("affiliates");
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<
    AffiliateProduct[]
  >([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form states
  const [newAffiliate, setNewAffiliate] = useState({
    name: "",
    email: "",
    referral_code: "",
    coupon_code: "",
    commission_rate: "0.20",
    discount_percent: "10",
  });
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_percent: "10",
    max_uses: "",
    expires_at: "",
  });
  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    stripe_price_id: "",
    download_url: "",
  });
  const [newAssignment, setNewAssignment] = useState({
    affiliate_id: "",
    product_id: "",
    custom_commission_rate: "",
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    image_url: "",
    stripe_price_id: "",
    download_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [affiliateEditForm, setAffiliateEditForm] = useState({
    name: "",
    email: "",
    referral_code: "",
    coupon_code: "",
    commission_rate: 0.2,
    discount_percent: 10,
  });

  const headers = {
    "Content-Type": "application/json",
    "x-admin-password": password,
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [aff, coup, prod, ap, ref] = await Promise.all([
        fetch("/api/admin?type=affiliates", { headers }).then((r) => r.json()),
        fetch("/api/admin?type=coupons", { headers }).then((r) => r.json()),
        fetch("/api/admin?type=products", { headers }).then((r) => r.json()),
        fetch("/api/admin?type=affiliate_products", { headers }).then((r) =>
          r.json()
        ),
        fetch("/api/admin?type=referrals", { headers }).then((r) => r.json()),
      ]);
      setAffiliates(aff.data || []);
      setCoupons(coup.data || []);
      setProducts(prod.data || []);
      setAffiliateProducts(ap.data || []);
      setReferrals(ref.data || []);
    } catch {
      setMsg("Error loading data");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin?type=affiliates", {
      headers: {
        "x-admin-password": password,
      },
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setMsg("Wrong password");
    }
  }

  async function createAffiliate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "affiliate",
        ...newAffiliate,
        commission_rate: parseFloat(newAffiliate.commission_rate),
        discount_percent: parseFloat(newAffiliate.discount_percent),
      }),
    });
    const data = await res.json();
    if (data.data) {
      setMsg("Affiliate created!");
      setNewAffiliate({
        name: "",
        email: "",
        referral_code: "",
        coupon_code: "",
        commission_rate: "0.20",
        discount_percent: "10",
      });
      loadData();
    } else {
      setMsg("Error: " + (data.error || "Unknown"));
    }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "coupon",
        code: newCoupon.code,
        discount_percent: parseFloat(newCoupon.discount_percent),
        max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
        expires_at: newCoupon.expires_at || null,
      }),
    });
    const data = await res.json();
    if (data.data) {
      setMsg("Coupon created!");
      setNewCoupon({
        code: "",
        discount_percent: "10",
        max_uses: "",
        expires_at: "",
      });
      loadData();
    } else {
      setMsg("Error: " + (data.error || "Unknown"));
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "product",
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price: parseInt(newProduct.price),
        stripe_price_id: newProduct.stripe_price_id || null,
        download_url: newProduct.download_url || null,
      }),
    });
    const data = await res.json();
    if (data.data) {
      setMsg("Product created!");
      setNewProduct({
        name: "",
        slug: "",
        description: "",
        price: "",
        stripe_price_id: "",
        download_url: "",
      });
      loadData();
    } else {
      setMsg("Error: " + (data.error || "Unknown"));
    }
  }

  async function toggleProduct(id: string, currentActive: boolean) {
    await fetch("/api/admin", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        type: "product",
        id,
        is_active: !currentActive,
      }),
    });
    loadData();
  }

  function startEditing(p: Product) {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      image_url: p.image_url || "",
      stripe_price_id: p.stripe_price_id || "",
      download_url: p.download_url || "",
    });
    setImagePreview(p.image_url || null);
  }

  function cancelEditing() {
    setEditingProduct(null);
    setImagePreview(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setEditForm((prev) => ({ ...prev, image_url: data.url }));
        setMsg("Image uploaded!");
      } else {
        setMsg("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setMsg("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          type: "product",
          id: editingProduct.id,
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          image_url: editForm.image_url,
          download_url: editForm.download_url,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg("Save failed: " + (err.error || "Unknown error"));
        return;
      }
      setMsg("Product saved!");
      setEditingProduct(null);
      setImagePreview(null);
      loadData();
    } catch (err) {
      setMsg("Error saving: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  async function saveAffiliate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAffiliate) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          type: "affiliate",
          id: editingAffiliate.id,
          name: affiliateEditForm.name,
          email: affiliateEditForm.email,
          referral_code: affiliateEditForm.referral_code,
          coupon_code: affiliateEditForm.coupon_code,
          commission_rate: affiliateEditForm.commission_rate,
          discount_percent: affiliateEditForm.discount_percent,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMsg("Save failed: " + (err.error || "Unknown error"));
        return;
      }
      setMsg("Affiliate updated!");
      setEditingAffiliate(null);
      loadData();
    } catch (err) {
      setMsg("Error saving: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "affiliate_product",
        affiliate_id: newAssignment.affiliate_id,
        product_id: newAssignment.product_id,
        custom_commission_rate: newAssignment.custom_commission_rate
          ? parseFloat(newAssignment.custom_commission_rate)
          : null,
      }),
    });
    const data = await res.json();
    if (data.data) {
      setMsg("Assignment created!");
      setNewAssignment({
        affiliate_id: "",
        product_id: "",
        custom_commission_rate: "",
      });
      loadData();
    } else {
      setMsg("Error: " + (data.error || "Unknown"));
    }
  }

  async function toggleAffiliate(id: string, currentActive: boolean) {
    await fetch("/api/admin", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        type: "affiliate",
        id,
        is_active: !currentActive,
      }),
    });
    loadData();
  }

  async function updateCommission(id: string, newRate: string) {
    await fetch("/api/admin", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        type: "affiliate",
        id,
        commission_rate: parseFloat(newRate),
      }),
    });
    loadData();
  }

  async function toggleCoupon(id: string, currentActive: boolean) {
    await fetch("/api/admin", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        type: "coupon",
        id,
        is_active: !currentActive,
      }),
    });
    loadData();
  }

  async function removeAssignment(id: string) {
    await fetch(`/api/admin?type=affiliate_product&id=${id}`, {
      method: "DELETE",
      headers,
    });
    loadData();
  }

  const inputClass =
    "w-full rounded-lg border border-card-border bg-card-bg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none";
  const btnClass =
    "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover transition-colors cursor-pointer";
  const labelClass = "text-xs font-medium text-muted";

  // LOGIN SCREEN
  if (!authed) {
    return (
      <section className="mx-auto max-w-md px-4 py-24">
        <h1 className="text-2xl font-extrabold tracking-tight text-center">
          Admin Dashboard
        </h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={inputClass + " mt-1"}
              required
            />
          </div>
          <button type="submit" className={btnClass + " w-full py-3"}>
            Login
          </button>
          {msg && (
            <p className="text-sm text-red-400 text-center">{msg}</p>
          )}
        </form>
      </section>
    );
  }

  // ADMIN DASHBOARD
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Admin Dashboard
        </h1>
        <button
          onClick={loadData}
          disabled={loading}
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {msg && (
        <div className="mt-4 rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm text-accent">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex border-b border-card-border overflow-x-auto">
        {(
          [
            ["affiliates", "Affiliates"],
            ["coupons", "Coupons"],
            ["products", "Products"],
            ["assignments", "Product Assignments"],
            ["referrals", "Referrals"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
              tab === key
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* AFFILIATES TAB */}
      {tab === "affiliates" && (
        <div className="mt-6 space-y-6">
          {/* Create Form */}
        {editingAffiliate && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-pink-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Affiliate</h3>
              <button onClick={() => setEditingAffiliate(null)} className="text-gray-400 hover:text-white">Cancel</button>
            </div>
            <form onSubmit={saveAffiliate}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.name} onChange={e => setAffiliateEditForm({...affiliateEditForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.email} onChange={e => setAffiliateEditForm({...affiliateEditForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Referral Code</label>
                  <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.referral_code} onChange={e => setAffiliateEditForm({...affiliateEditForm, referral_code: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-1">Coupon Code</label>
                  <input className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.coupon_code || ""} onChange={e => setAffiliateEditForm({...affiliateEditForm, coupon_code: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Commission Rate (0.20 = 20%)</label>
                  <input type="number" step="0.01" className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.commission_rate} onChange={e => setAffiliateEditForm({...affiliateEditForm, commission_rate: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Discount % for Customers</label>
                  <input type="number" className="w-full p-2 rounded bg-gray-800 border border-gray-700" value={affiliateEditForm.discount_percent} onChange={e => setAffiliateEditForm({...affiliateEditForm, discount_percent: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="bg-pink-300 text-black px-6 py-3 rounded-lg font-semibold w-full hover:bg-pink-400">Save Changes</button>
            </form>
          </div>
        )}

          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <h2 className="text-lg font-bold">Add Affiliate</h2>
            <form
              onSubmit={createAffiliate}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={newAffiliate.name}
                  onChange={(e) =>
                    setNewAffiliate({ ...newAffiliate, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={newAffiliate.email}
                  onChange={(e) =>
                    setNewAffiliate({ ...newAffiliate, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Referral Code</label>
                <input
                  value={newAffiliate.referral_code}
                  onChange={(e) =>
                    setNewAffiliate({
                      ...newAffiliate,
                      referral_code: e.target.value,
                    })
                  }
                  placeholder="john123"
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Coupon Code</label>
                <input
                  value={newAffiliate.coupon_code}
                  onChange={(e) =>
                    setNewAffiliate({
                      ...newAffiliate,
                      coupon_code: e.target.value,
                    })
                  }
                  placeholder="JOHN10"
                  className={inputClass + " mt-1"}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Commission Rate (0.20 = 20%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={newAffiliate.commission_rate}
                  onChange={(e) =>
                    setNewAffiliate({
                      ...newAffiliate,
                      commission_rate: e.target.value,
                    })
                  }
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Discount % for Customers</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={newAffiliate.discount_percent}
                  onChange={(e) =>
                    setNewAffiliate({
                      ...newAffiliate,
                      discount_percent: e.target.value,
                    })
                  }
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <button type="submit" className={btnClass}>
                  Create Affiliate
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {affiliates.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border bg-card-bg p-4 ${
                  a.is_active
                    ? "border-card-border"
                    : "border-red-500/30 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-bold">{a.name}</div>
                    <div className="text-sm text-muted">{a.email}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                      <span>
                        Ref:{" "}
                        <span className="font-mono text-accent">
                          {a.referral_code}
                        </span>
                      </span>
                      {a.coupon_code && (
                        <span>
                          Coupon:{" "}
                          <span className="font-mono text-accent">
                            {a.coupon_code}
                          </span>
                        </span>
                      )}
                      <span>
                        Commission: {(a.commission_rate * 100).toFixed(0)}%
                      </span>
                      {a.discount_percent > 0 && (
                        <span>Discount: {a.discount_percent}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="text-accent font-bold">
                        ${((a.total_earnings ?? 0) / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted">earned</div>
                    </div>
                    <select
                      value={a.commission_rate}
                      onChange={(e) => updateCommission(a.id, e.target.value)}
                      className="rounded border border-card-border bg-background px-2 py-1 text-xs text-foreground cursor-pointer"
                    >
                      <option value="0.05">5%</option>
                      <option value="0.10">10%</option>
                      <option value="0.15">15%</option>
                      <option value="0.20">20%</option>
                      <option value="0.25">25%</option>
                      <option value="0.30">30%</option>
                      <option value="0.40">40%</option>
                      <option value="0.50">50%</option>
                    </select>
                  <button
                    onClick={() => {
                      setEditingAffiliate(a);
                      setAffiliateEditForm({
                        name: a.name,
                        email: a.email,
                        referral_code: a.referral_code,
                        coupon_code: a.coupon_code || "",
                        commission_rate: a.commission_rate,
                        discount_percent: a.discount_percent,
                      });
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                    <button
                      onClick={() => toggleAffiliate(a.id, a.is_active)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium cursor-pointer ${
                        a.is_active
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      }`}
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Link:</span>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-pink-300 break-all">
                    {typeof window !== "undefined" ? window.location.origin : ""}/ref/{a.referral_code}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.origin + "/ref/" + a.referral_code
                      );
                      setMsg("Link copied!");
                    }}
                    className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 text-white"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
            {affiliates.length === 0 && (
              <p className="text-sm text-muted text-center py-8">
                No affiliates yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {tab === "coupons" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <h2 className="text-lg font-bold">Create Coupon</h2>
            <form
              onSubmit={createCoupon}
              className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className={labelClass}>Code</label>
                <input
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SAVE20"
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Discount %</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={newCoupon.discount_percent}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discount_percent: e.target.value,
                    })
                  }
                  className={inputClass + " mt-1"}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Max Uses (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={newCoupon.max_uses}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, max_uses: e.target.value })
                  }
                  placeholder="Unlimited"
                  className={inputClass + " mt-1"}
                />
              </div>
              <div>
                <label className={labelClass}>Expires (optional)</label>
                <input
                  type="date"
                  value={newCoupon.expires_at}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, expires_at: e.target.value })
                  }
                  className={inputClass + " mt-1"}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" className={btnClass}>
                  Create Coupon
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border bg-card-bg p-4 flex items-center justify-between ${
                  c.is_active
                    ? "border-card-border"
                    : "border-red-500/30 opacity-60"
                }`}
              >
                <div>
                  <div className="font-mono font-bold text-accent">
                    {c.code}
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-muted">
                    <span>{c.discount_percent}% off</span>
                    <span>
                      Used: {c.times_used}
                      {c.max_uses ? `/${c.max_uses}` : ""}
                    </span>
                    {c.expires_at && (
                      <span>
                        Expires:{" "}
                        {new Date(c.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleCoupon(c.id, c.is_active)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium cursor-pointer ${
                    c.is_active
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  }`}
                >
                  {c.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
            {coupons.length === 0 && (
              <p className="text-sm text-muted text-center py-8">
                No coupons yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div className="mt-6 space-y-6">
          {/* Edit Product Form */}
          {editingProduct && (
            <div className="rounded-xl border-2 border-accent/50 bg-card-bg p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Edit Product</h2>
                <button
                  onClick={cancelEditing}
                  className="rounded-lg border border-card-border px-3 py-1 text-xs text-muted hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={saveProduct} className="mt-4 space-y-4">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-card-border p-6 sm:flex-row">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-card-border bg-background">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">ÃÂ°ÃÂÃÂÃÂ</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-center sm:text-left">
                    <label className="text-sm font-medium">Product Image</label>
                    <p className="text-xs text-muted">
                      Upload a JPG, PNG, or WebP. This shows on the product page.
                    </p>
                    <label
                      className={`${btnClass} inline-block w-fit text-center ${
                        uploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {uploading ? "Uploading..." : "Choose Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {editForm.image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({ ...prev, image_url: "" }));
                          setImagePreview(null);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClass}>Product Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className={inputClass + " mt-1"}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Slug (URL path)</label>
                    <input
                      value={editForm.slug}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      className={inputClass + " mt-1"}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Price (in cents, e.g. 2999 = $29.99)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                      className={inputClass + " mt-1"}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className={inputClass + " mt-1"}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Stripe Price ID (optional)
                    </label>
                    <input
                      value={editForm.stripe_price_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          stripe_price_id: e.target.value,
                        })
                      }
                      className={inputClass + " mt-1"}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Download URL (optional)</label>
                    <input
                      value={editForm.download_url}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          download_url: e.target.value,
                        })
                      }
                      className={inputClass + " mt-1"}
                    />
                  </div>
                </div>

                <button type="submit" className={btnClass + " w-full py-3"}>
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Create Product Form */}
          {!editingProduct && (
            <div className="rounded-xl border border-card-border bg-card-bg p-5">
              <h2 className="text-lg font-bold">Add Product</h2>
              <form
                onSubmit={createProduct}
                className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Money Mastery Guide"
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug (URL path)</label>
                  <input
                    value={newProduct.slug}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    placeholder="money-mastery-guide"
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Price (in cents, e.g. 2999 = $29.99)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="2999"
                    className={inputClass + " mt-1"}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short description"
                    className={inputClass + " mt-1"}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Stripe Price ID (optional)
                  </label>
                  <input
                    value={newProduct.stripe_price_id}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stripe_price_id: e.target.value,
                      })
                    }
                    placeholder="price_abc123"
                    className={inputClass + " mt-1"}
                  />
                </div>
                <div>
                  <label className={labelClass}>Download URL (optional)</label>
                  <input
                    value={newProduct.download_url}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        download_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className={inputClass + " mt-1"}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <button type="submit" className={btnClass}>
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product List */}
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border bg-card-bg p-4 ${
                  p.is_active
                    ? "border-card-border"
                    : "border-red-500/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="hidden h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-card-border bg-background sm:flex">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">ÃÂ°ÃÂÃÂÃÂ</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{p.name}</div>
                    {p.description && (
                      <div className="mt-0.5 text-xs text-muted truncate">
                        {p.description}
                      </div>
                    )}
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                      <span>
                        Slug:{" "}
                        <span className="font-mono text-accent">{p.slug}</span>
                      </span>
                      <span>${(p.price / 100).toFixed(2)}</span>
                      {p.image_url && (
                        <span className="text-green-400">Has image</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => startEditing(p)}
                      className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent/20 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleProduct(p.id, p.is_active)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium cursor-pointer ${
                        p.is_active
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      }`}
                    >
                      {p.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-muted text-center py-8">
                No products yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {tab === "assignments" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-card-border bg-card-bg p-5">
            <h2 className="text-lg font-bold">Assign Affiliate to Product</h2>
            <form
              onSubmit={createAssignment}
              className="mt-4 grid gap-3 sm:grid-cols-3"
            >
              <div>
                <label className={labelClass}>Affiliate</label>
                <select
                  value={newAssignment.affiliate_id}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      affiliate_id: e.target.value,
                    })
                  }
                  className={inputClass + " mt-1 cursor-pointer"}
                  required
                >
                  <option value="">Select affiliate...</option>
                  {affiliates
                    .filter((a) => a.is_active)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Product</label>
                <select
                  value={newAssignment.product_id}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      product_id: e.target.value,
                    })
                  }
                  className={inputClass + " mt-1 cursor-pointer"}
                  required
                >
                  <option value="">Select product...</option>
                  {products
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Custom Commission (optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={newAssignment.custom_commission_rate}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      custom_commission_rate: e.target.value,
                    })
                  }
                  placeholder="Use default"
                  className={inputClass + " mt-1"}
                />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" className={btnClass}>
                  Assign
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {affiliateProducts.map((ap) => (
              <div
                key={ap.id}
                className="rounded-xl border border-card-border bg-card-bg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">{ap.affiliates?.name}</div>
                  <div className="text-sm text-muted">
                    Product: {ap.products?.name}
                    {ap.custom_commission_rate
                      ? ` | Custom: ${(
                          ap.custom_commission_rate * 100
                        ).toFixed(0)}%`
                      : ""}
                  </div>
                </div>
                <button
                  onClick={() => removeAssignment(ap.id)}
                  className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
            {affiliateProducts.length === 0 && (
              <p className="text-sm text-muted text-center py-8">
                No assignments yet. Assign affiliates to specific products
                above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* REFERRALS TAB */}
      {tab === "referrals" && (
        <div className="mt-6 space-y-3">
          {referrals.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-card-border bg-card-bg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-bold">{r.affiliates?.name}</div>
                <div className="text-sm text-muted">
                  {r.affiliates?.email} |{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-accent font-bold">
                  ${(r.commission_amount / 100).toFixed(2)}
                </div>
                <div
                  className={`text-xs ${
                    r.status === "paid"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {r.status}
                </div>
              </div>
            </div>
          ))}
          {referrals.length === 0 && (
            <p className="text-sm text-muted text-center py-8">
              No referrals yet
            </p>
          )}
        </div>
      )}
    </section>
  );
}
