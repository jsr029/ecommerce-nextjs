"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductType, User, Event, LiveStream, Order } from "@/types";
import {
  Plus, Trash2, Edit2, X, Save, Users, Package, Music, Calendar,
  Shield, Radio,
} from "lucide-react";

type Tab = "users" | "products" | "music" | "events" | "live" | "orders";

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "Musique",
  stock: 9999,
  featured: false,
  productType: "music" as ProductType,
  mediaUrl: "",
  previewUrl: "",
  previewDuration: 30,
  duration: 0,
  fileSize: "",
  format: "",
};

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "user" as "user" | "admin",
  subscriptionPlan: "none" as string,
  subscriptionStatus: "none" as string,
  subscriptionExpiresAt: "",
};

const emptyEvent = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  location: "",
  city: "",
  image: "",
  ticketPrice: 0,
  category: "concert" as string,
  featured: false,
  capacity: 100,
};

const emptyLive = {
  title: "",
  description: "",
  streamUrl: "",
  coverImage: "",
  isLive: false,
  djName: "",
  genre: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [loading, setLoading] = useState(true);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [cancelModal, setCancelModal] = useState<{ id: string; status: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Forms
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<"product" | "user" | "event" | "live">("product");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [userForm, setUserForm] = useState(emptyUser);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [liveForm, setLiveForm] = useState(emptyLive);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem("token") || "";

  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
  });

  const checkAdmin = useCallback(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!t || !u) {
      router.push("/login");
      return false;
    }
    try {
      if (JSON.parse(u).role !== "admin") {
        router.push("/");
        return false;
      }
    } catch {
      router.push("/login");
      return false;
    }
    return true;
  }, [router]);

  const loadAll = useCallback(async () => {
    if (!checkAdmin()) return;
    setLoading(true);
    try {
      const [pRes, uRes, eRes, lRes, oRes] = await Promise.all([
        fetch("/api/admin/products", { headers: authHeaders() }),
        fetch("/api/admin/users", { headers: authHeaders() }),
        fetch("/api/admin/events", { headers: authHeaders() }),
        fetch("/api/admin/live", { headers: authHeaders() }),
        fetch("/api/admin/orders", { headers: authHeaders() }),
      ]);
      const [p, u, e, l, o] = await Promise.all([pRes.json(), uRes.json(), eRes.json(), lRes.json(), oRes.json()]);
      setProducts(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
      setEvents(Array.isArray(e) ? e : []);
      setStreams(Array.isArray(l) ? l : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checkAdmin]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // --- Open forms ---
  const openCreateProduct = (type: ProductType = "physical") => {
    setProductForm({ ...emptyProduct, productType: type, category: type === "music" ? "Musique" : type === "video" ? "Vidéo" : type === "photo" ? "Photos" : "Général" });
    setEditingId(null);
    setFormType("product");
    setShowForm(true);
    setError("");
  };

  const openEditProduct = (p: Product) => {
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category,
      stock: p.stock,
      featured: p.featured,
      productType: p.productType || "physical",
      mediaUrl: p.mediaUrl || "",
      previewUrl: p.previewUrl || "",
      previewDuration: p.previewDuration || 30,
      duration: p.duration || 0,
      fileSize: p.fileSize || "",
      format: p.format || "",
    });
    setEditingId(p._id);
    setFormType("product");
    setShowForm(true);
    setError("");
  };

  const openCreateUser = () => {
    setUserForm(emptyUser);
    setEditingId(null);
    setFormType("user");
    setShowForm(true);
    setError("");
  };

  const openEditUser = (u: User) => {
    setUserForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      subscriptionPlan: u.subscriptionPlan || "none",
      subscriptionStatus: u.subscriptionStatus || "none",
      subscriptionExpiresAt: u.subscriptionExpiresAt
        ? new Date(u.subscriptionExpiresAt).toISOString().slice(0, 16)
        : "",
    });
    setEditingId(u._id);
    setFormType("user");
    setShowForm(true);
    setError("");
  };

  const openCreateEvent = () => {
    setEventForm(emptyEvent);
    setEditingId(null);
    setFormType("event");
    setShowForm(true);
    setError("");
  };

  const openEditEvent = (ev: Event) => {
    setEventForm({
      title: ev.title,
      description: ev.description,
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : "",
      location: ev.location,
      city: ev.city,
      image: ev.image,
      ticketPrice: ev.ticketPrice,
      category: ev.category,
      featured: ev.featured,
      capacity: ev.capacity || 100,
    });
    setEditingId(ev._id);
    setFormType("event");
    setShowForm(true);
    setError("");
  };


  const openCreateLive = () => {
    setLiveForm(emptyLive);
    setEditingId(null);
    setFormType("live");
    setShowForm(true);
    setError("");
  };

  const openEditLive = (s: LiveStream) => {
    setLiveForm({
      title: s.title,
      description: s.description,
      streamUrl: s.streamUrl,
      coverImage: s.coverImage,
      isLive: s.isLive,
      djName: s.djName || "",
      genre: s.genre || "",
    });
    setEditingId(s._id);
    setFormType("live");
    setShowForm(true);
    setError("");
  };

  // --- Save ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (formType === "product") {
        const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(productForm),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur"); return; }
      } else if (formType === "user") {
        const body: Record<string, unknown> = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          subscriptionPlan: userForm.subscriptionPlan,
          subscriptionStatus: userForm.subscriptionStatus,
        };
        if (userForm.password) body.password = userForm.password;
        if (userForm.subscriptionExpiresAt) {
          body.subscriptionExpiresAt = new Date(userForm.subscriptionExpiresAt).toISOString();
        }
        const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
        if (!editingId) body.password = userForm.password || "changeme123";
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur"); return; }
      } else if (formType === "event") {
        const body = {
          ...eventForm,
          date: new Date(eventForm.date).toISOString(),
          endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : undefined,
          ticketPrice: Number(eventForm.ticketPrice),
          capacity: Number(eventForm.capacity),
        };
        const url = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur"); return; }
      } else if (formType === "live") {
        const url = editingId ? `/api/admin/live/${editingId}` : "/api/admin/live";
        const res = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(liveForm),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur"); return; }
      }
      setShowForm(false);
      loadAll();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: "product" | "user" | "event" | "live", id: string) => {
    if (!confirm("Confirmer la suppression ?")) return;
    const paths: Record<string, string> = {
      product: `/api/admin/products/${id}`,
      user: `/api/admin/users/${id}`,
      event: `/api/admin/events/${id}`,
      live: `/api/admin/live/${id}`,
    };
    await fetch(paths[type], { method: "DELETE", headers: authHeaders() });
    loadAll();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur");
      return;
    }
    loadAll();
  };

  const confirmCancelOrder = async () => {
    if (!cancelModal) return;
    if (cancelReason.trim().length < 5) {
      alert("Motif d'annulation requis (min. 5 caractères)");
      return;
    }
    const res = await fetch(`/api/admin/orders/${cancelModal.id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        status: "cancelled",
        cancelReason: cancelReason.trim(),
        force: cancelModal.status === "delivered",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Erreur");
      return;
    }
    setCancelModal(null);
    setCancelReason("");
    loadAll();
  };

  const filteredOrders =
    orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);

  const musicProducts = products.filter((p) => p.productType === "music");
  const otherProducts = products.filter((p) => p.productType !== "music");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400">
        Chargement du panneau admin...
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "products", label: "Produits", icon: <Package className="w-4 h-4" />, count: otherProducts.length },
    { id: "music", label: "Musiques", icon: <Music className="w-4 h-4" />, count: musicProducts.length },
    { id: "events", label: "Événements", icon: <Calendar className="w-4 h-4" />, count: events.length },
    { id: "users", label: "Utilisateurs", icon: <Users className="w-4 h-4" />, count: users.length },
    { id: "live", label: "Live", icon: <Radio className="w-4 h-4" />, count: streams.length },
    { id: "orders", label: "Commandes", icon: <Package className="w-4 h-4" />, count: orders.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-amber-600" />
        <h1 className="text-3xl font-bold text-stone-100">Administration</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition ${
              tab === t.id
                ? "bg-primary-600 text-white"
                : "bg-stage-800 text-stone-300 hover:bg-stage-700"
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-slate-200"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex justify-end mb-4">
        {tab === "products" && (
          <button onClick={() => openCreateProduct("physical")} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Produit
          </button>
        )}
        {tab === "music" && (
          <button onClick={() => openCreateProduct("music")} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Morceau
          </button>
        )}
        {tab === "events" && (
          <button onClick={openCreateEvent} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Événement
          </button>
        )}
        {tab === "users" && (
          <button onClick={openCreateUser} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700">
            <Plus className="w-4 h-4" /> Utilisateur
          </button>
        )}
        {tab === "live" && (
          <button onClick={openCreateLive} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">
            <Plus className="w-4 h-4" /> Flux live
          </button>
        )}
      </div>

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <AdminTable
          headers={["Produit", "Type", "Prix", "Stock", ""]}
          rows={otherProducts.map((p) => [
            <div key="n" className="flex items-center gap-3">
              <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category}</p>
              </div>
            </div>,
            <span key="t" className="text-xs bg-slate-100 px-2 py-0.5 rounded">{p.productType}</span>,
            `${p.price.toFixed(2)} €`,
            String(p.stock),
            <div key="a" className="flex gap-2">
              <button onClick={() => openEditProduct(p)} className="p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete("product", p._id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>,
          ])}
          empty="Aucun produit. Ajoutez-en ou lancez npm run seed."
        />
      )}

      {/* MUSIC TAB */}
      {tab === "music" && (
        <AdminTable
          headers={["Morceau", "Prix", "Aperçu", "Format", ""]}
          rows={musicProducts.map((p) => [
            <div key="n" className="flex items-center gap-3">
              <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-400">{p.duration ? `${Math.floor(p.duration / 60)} min` : ""}</p>
              </div>
            </div>,
            `${p.price.toFixed(2)} €`,
            p.previewDuration ? `${p.previewDuration}s` : "—",
            p.format || "—",
            <div key="a" className="flex gap-2">
              <button onClick={() => openEditProduct(p)} className="p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete("product", p._id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>,
          ])}
          empty="Aucun morceau. Cliquez sur + Morceau."
        />
      )}

      {/* EVENTS TAB */}
      {tab === "events" && (
        <AdminTable
          headers={["Événement", "Date", "Ville", "Prix", ""]}
          rows={events.map((ev) => [
            <div key="n">
              <p className="font-medium">{ev.title}</p>
              <p className="text-xs text-slate-400">{ev.category}</p>
            </div>,
            new Date(ev.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            ev.city,
            ev.ticketPrice === 0 ? "Gratuit" : `${ev.ticketPrice} €`,
            <div key="a" className="flex gap-2">
              <button onClick={() => openEditEvent(ev)} className="p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete("event", ev._id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>,
          ])}
          empty="Aucun événement."
        />
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <AdminTable
          headers={["Utilisateur", "Rôle", "Abonnement", "Expire", ""]}
          rows={users.map((u) => [
            <div key="n">
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>,
            <span key="r" className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {u.role}
            </span>,
            <span key="s" className={`text-xs px-2 py-0.5 rounded-full ${u.subscriptionStatus === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {u.subscriptionStatus === "active" ? u.subscriptionPlan : u.subscriptionStatus || "none"}
            </span>,
            u.subscriptionExpiresAt
              ? new Date(u.subscriptionExpiresAt).toLocaleDateString("fr-FR")
              : "—",
            <div key="a" className="flex gap-2">
              <button onClick={() => openEditUser(u)} className="p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete("user", u._id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>,
          ])}
          empty="Aucun utilisateur."
        />
      )}



      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setOrderFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  orderFilter === s
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {s === "all" ? "Toutes" : s}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredOrders.length === 0 && (
              <p className="text-center py-10 text-slate-600">Aucune commande.</p>
            )}
            {filteredOrders.map((order) => {
              const userObj = typeof order.user === "object" && order.user ? order.user : null;
              const userLabel = userObj
                ? `${userObj.name || ""} ${userObj.email ? `(${userObj.email})` : ""}`
                : String(order.user);
              const paid = order.status === "paid" || order.paymentMethod === "paypal";
              return (
                <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-4 text-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(order.createdAt).toLocaleString("fr-FR")} · {userLabel}
                      </p>
                      <p className="text-xs mt-1">
                        <span className={`font-semibold ${paid || order.status === "paid" ? "text-green-700" : "text-amber-700"}`}>
                          {order.status === "paid" || order.paymentMethod === "paypal"
                            ? "Payée"
                            : order.status === "cancelled"
                            ? "Non payée (annulée)"
                            : order.status === "pending"
                            ? "Paiement en attente"
                            : `Statut: ${order.status}`}
                        </span>
                        {order.paymentMethod && order.paymentMethod !== "none" && (
                          <span className="text-slate-500 ml-2">· {order.paymentMethod}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{order.total.toFixed(2)} €</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === "cancelled" ? "bg-red-100 text-red-800" :
                        order.status === "paid" || order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-900" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <ul className="text-sm text-slate-700 mb-3 space-y-0.5">
                    {order.items.map((it, i) => (
                      <li key={i}>{it.name} × {it.quantity} — {(it.price * it.quantity).toFixed(2)} €</li>
                    ))}
                  </ul>
                  {order.cancelReason && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                      Annulation ({order.cancelledBy}) : {order.cancelReason}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "pending" && (
                      <button onClick={() => updateOrderStatus(order._id, "paid")} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Marquer payée
                      </button>
                    )}
                    {["paid", "pending"].includes(order.status) && (
                      <button onClick={() => updateOrderStatus(order._id, "processing")} className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        En cours
                      </button>
                    )}
                    {["processing", "paid"].includes(order.status) && (
                      <button onClick={() => updateOrderStatus(order._id, "shipped")} className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Expédiée
                      </button>
                    )}
                    {["shipped", "processing"].includes(order.status) && (
                      <button onClick={() => updateOrderStatus(order._id, "delivered")} className="text-xs px-3 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">
                        Livrée
                      </button>
                    )}
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => { setCancelModal({ id: order._id, status: order.status }); setCancelReason(""); }}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Annuler…
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIVE TAB */}
      {tab === "live" && (
        <AdminTable
          headers={["Flux", "DJ / Genre", "Statut", "URL", ""]}
          rows={streams.map((s) => [
            <div key="n" className="flex items-center gap-3">
              <img src={s.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-slate-400 line-clamp-1">{s.description}</p>
              </div>
            </div>,
            <span key="dj" className="text-xs">{s.djName || "—"}{s.genre ? ` · ${s.genre}` : ""}</span>,
            s.isLive ? (
              <span key="st" className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
              </span>
            ) : (
              <span key="st" className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Hors antenne</span>
            ),
            <span key="u" className="text-xs text-slate-400 truncate max-w-[120px] block">{s.streamUrl}</span>,
            <div key="a" className="flex gap-2">
              <button onClick={() => openEditLive(s)} className="p-1.5 text-slate-500 hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete("live", s._id)} className="p-1.5 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>,
          ])}
          empty="Aucun flux live. Ajoutez une URL Icecast/Shoutcast/MP3 stream."
        />
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Modifier" : "Créer"} –{" "}
                {formType === "product" ? "Produit" : formType === "user" ? "Utilisateur" : formType === "live" ? "Flux live" : "Événement"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              {formType === "product" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea required rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix (€) *</label>
                    <input type="number" step="0.01" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select value={productForm.productType} onChange={(e) => setProductForm({ ...productForm, productType: e.target.value as ProductType })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="physical">Physique</option>
                      <option value="music">Musique</option>
                      <option value="video">Vidéo</option>
                      <option value="photo">Photos</option>
                      <option value="digital">Digital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie *</label>
                    <input required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">URL Image *</label>
                    <input required value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  {productForm.productType !== "physical" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">URL fichier complet</label>
                        <input value={productForm.mediaUrl} onChange={(e) => setProductForm({ ...productForm, mediaUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">URL aperçu (preview)</label>
                        <input value={productForm.previewUrl} onChange={(e) => setProductForm({ ...productForm, previewUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Durée aperçu (s)</label>
                        <input type="number" value={productForm.previewDuration} onChange={(e) => setProductForm({ ...productForm, previewDuration: parseInt(e.target.value) || 30 })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Durée totale (s)</label>
                        <input type="number" value={productForm.duration} onChange={(e) => setProductForm({ ...productForm, duration: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Taille</label>
                        <input value={productForm.fileSize} onChange={(e) => setProductForm({ ...productForm, fileSize: e.target.value })} placeholder="4.8 MB" className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Format</label>
                        <input value={productForm.format} onChange={(e) => setProductForm({ ...productForm, format: e.target.value })} placeholder="MP3 320kbps" className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                    </>
                  )}
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="feat" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} />
                    <label htmlFor="feat" className="text-sm">Vedette</label>
                  </div>
                </div>
              )}

              {formType === "user" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom *</label>
                    <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe {editingId ? "(laisser vide = inchangé)" : "*"}</label>
                    <input type="password" required={!editingId} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rôle</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "user" | "admin" })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan abonnement</label>
                    <select value={userForm.subscriptionPlan} onChange={(e) => setUserForm({ ...userForm, subscriptionPlan: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="none">Aucun</option>
                      <option value="monthly">Mensuel</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Statut abo</label>
                    <select value={userForm.subscriptionStatus} onChange={(e) => setUserForm({ ...userForm, subscriptionStatus: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="none">Aucun</option>
                      <option value="active">Actif</option>
                      <option value="expired">Expiré</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Expire le</label>
                    <input type="datetime-local" value={userForm.subscriptionExpiresAt} onChange={(e) => setUserForm({ ...userForm, subscriptionExpiresAt: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              )}

              {formType === "event" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Titre *</label>
                    <input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea required rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date début *</label>
                    <input type="datetime-local" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date fin</label>
                    <input type="datetime-local" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lieu *</label>
                    <input required value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ville *</label>
                    <input required value={eventForm.city} onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">URL Image *</label>
                    <input required value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix billet (€)</label>
                    <input type="number" step="0.01" value={eventForm.ticketPrice} onChange={(e) => setEventForm({ ...eventForm, ticketPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="concert">Concert</option>
                      <option value="festival">Festival</option>
                      <option value="workshop">Workshop</option>
                      <option value="meetup">Meetup</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacité</label>
                    <input type="number" value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="efeat" checked={eventForm.featured} onChange={(e) => setEventForm({ ...eventForm, featured: e.target.checked })} />
                    <label htmlFor="efeat" className="text-sm">Vedette</label>
                  </div>
                </div>
              )}


              {formType === "live" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Titre *</label>
                    <input required value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea required rows={2} value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">URL du flux audio *</label>
                    <input required value={liveForm.streamUrl} onChange={(e) => setLiveForm({ ...liveForm, streamUrl: e.target.value })} placeholder="https://... (Icecast, Shoutcast, MP3 stream)" className="w-full px-3 py-2 border rounded-lg" />
                    <p className="text-xs text-slate-400 mt-1">Ex. Icecast : http://host:8000/stream.mp3</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">URL image de couverture *</label>
                    <input required value={liveForm.coverImage} onChange={(e) => setLiveForm({ ...liveForm, coverImage: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">DJ / Animateur</label>
                    <input value={liveForm.djName} onChange={(e) => setLiveForm({ ...liveForm, djName: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Genre</label>
                    <input value={liveForm.genre} onChange={(e) => setLiveForm({ ...liveForm, genre: e.target.value })} placeholder="Electro, Jazz..." className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="islive" checked={liveForm.isLive} onChange={(e) => setLiveForm({ ...liveForm, isLive: e.target.checked })} />
                    <label htmlFor="islive" className="text-sm font-medium text-red-600">En direct maintenant (désactive les autres flux live)</label>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "..." : "Enregistrer"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border rounded-xl hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl text-slate-900">
            <h3 className="text-lg font-bold mb-2">Annuler la commande</h3>
            <p className="text-sm text-slate-600 mb-4">
              Statut actuel : <strong>{cancelModal.status}</strong>. Un motif est obligatoire (CGV art. 5).
              {cancelModal.status === "delivered" && (
                <span className="block mt-1 text-amber-700">Commande livrée : annulation exceptionnelle.</span>
              )}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Motif d'annulation (min. 5 caractères)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCancelModal(null)} className="px-4 py-2 border rounded-lg text-slate-700">
                Fermer
              </button>
              <button onClick={confirmCancelOrder} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Confirmer l&apos;annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-center py-10 text-slate-400">{empty}</p>
      )}
    </div>
  );
}
