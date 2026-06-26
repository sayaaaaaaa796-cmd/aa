import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMenu, FiX, FiShoppingCart, FiSearch, FiMessageCircle, FiPlus, FiMinus,
  FiStar, FiTrash2, FiEdit3, FiLock, FiLogOut, FiShield, FiPackage, FiDollarSign,
  FiGrid, FiCreditCard, FiHome, FiClock
} from "react-icons/fi";

const ADMIN_EMAIL = "rakayou414@gmail.com";

const defaultProducts = [
  {
    id: 1,
    name: "Script Toko Premium",
    price: 150000,
    stock: 12,
    rating: 4.9,
    tag: "Best Seller",
    category: "Script",
    type: "Digital",
    desc: "Script toko online modern, cepat, dan mudah di-custom.",
    featured: true
  },
  {
    id: 2,
    name: "Bot WhatsApp Pro",
    price: 200000,
    stock: 8,
    rating: 4.8,
    tag: "Hot",
    category: "Bot",
    type: "Digital",
    desc: "Bot WA auto respon, menu interaktif, dan order system.",
    featured: true
  },
  {
    id: 3,
    name: "Panel Admin Dark",
    price: 350000,
    stock: 5,
    rating: 5.0,
    tag: "Premium",
    category: "Panel",
    type: "Digital",
    desc: "Panel admin profesional dengan UI gelap futuristik.",
    featured: true
  },
  {
    id: 4,
    name: "Jasa Setup Website",
    price: 100000,
    stock: 99,
    rating: 4.7,
    tag: "Service",
    category: "Jasa",
    type: "Service",
    desc: "Jasa setup website, deploy, dan konfigurasi dasar.",
    featured: false
  }
];

const formatIDR = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

const load = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState(() => load("ss_products", defaultProducts));
  const [cart, setCart] = useState(() => load("ss_cart", []));
  const [orders, setOrders] = useState(() => load("ss_orders", []));
  const [user, setUser] = useState(() => load("ss_user", null));
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Script",
    type: "Digital",
    tag: "",
    desc: ""
  });

  const [login, setLogin] = useState({ name: "", email: "" });

  useEffect(() => localStorage.setItem("ss_products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("ss_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("ss_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("ss_user", JSON.stringify(user)), [user]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const filtered = useMemo(() => {
    return products.filter((p) =>
      [p.name, p.desc, p.category, p.type, p.tag].join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const cartTotal = cart.reduce((a, b) => a + b.qty * b.price, 0);

  const saveProduct = () => {
    const payload = {
      name: form.name.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      category: form.category,
      type: form.type,
      tag: form.tag.trim(),
      desc: form.desc.trim(),
      featured: false
    };
    if (!payload.name || !payload.price) return;

    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p));
      setEditId(null);
    } else {
      setProducts(prev => [...prev, { id: Date.now(), rating: 5, ...payload }]);
    }

    setForm({ name: "", price: "", stock: "", category: "Script", type: "Digital", tag: "", desc: "" });
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      type: p.type,
      tag: p.tag,
      desc: p.desc
    });
    setAdminMode(true);
    window.location.hash = "#admin";
  };

  const removeProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const found = prev.find(x => x.id === product.id);
      if (found) {
        return prev.map(x => x.id === product.id ? { ...x, qty: Math.min(x.qty + 1, product.stock) } : x);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0)
    );
  };

  const changeStock = (id, delta) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  };

  const checkout = (method = "QRIS") => {
    if (!cart.length || !user) return;
    const order = {
      id: "ORD-" + Date.now(),
      user: user.email,
      items: cart,
      total: cartTotal,
      method,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [order, ...prev]);
    setCart([]);
    alert(`Order dibuat. Silakan bayar via ${method}.`);
  };

  const loginUser = () => {
    if (!login.email.trim()) return;
    setUser({ name: login.name || login.email.split("@")[0], email: login.email.trim() });
    setLogin({ name: "", email: "" });
  };

  const logout = () => {
    setUser(null);
    setAdminMode(false);
  };

  const contactAdmin = () => {
    window.open("https://wa.me/62813173580189", "_blank", "noreferrer");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_25%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              <span className="font-bold text-emerald-300">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">ScriptStore</h1>
              <p className="text-xs text-white/50">Dark Premium Marketplace</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#home" className="transition hover:text-emerald-300"><FiHome className="inline mr-1" />Beranda</a>
            <a href="#produk" className="transition hover:text-emerald-300"><FiPackage className="inline mr-1" />Produk</a>
            <a href="#admin" className="transition hover:text-emerald-300"><FiGrid className="inline mr-1" />Admin</a>
            <a href="#qris" className="transition hover:text-emerald-300"><FiCreditCard className="inline mr-1" />QRIS</a>
            <a href="#orders" className="transition hover:text-emerald-300"><FiClock className="inline mr-1" />Order</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
              <FiSearch className="text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 bg-transparent text-sm outline-none placeholder:text-white/30"
                placeholder="Cari..."
              />
            </div>

            <button className="relative rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
              <FiShoppingCart />
              <span className="absolute -right-2 -top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-black">
                {cartCount}
              </span>
            </button>

            {user ? (
              <button onClick={logout} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <FiLogOut />
              </button>
            ) : null}

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 md:hidden"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 bg-black/95 md:hidden"
            >
              <div className="flex flex-col gap-3 px-4 py-4 text-white/75">
                <a href="#home">Beranda</a>
                <a href="#produk">Produk</a>
                <a href="#admin">Admin</a>
                <a href="#qris">QRIS</a>
                <a href="#orders">Order</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        {!user ? (
          <section id="home" className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                <FiShield /> Premium Digital Store
              </div>
              <h2 className="text-4xl font-black leading-tight md:text-6xl">
                Marketplace <span className="text-emerald-300">dark hacker</span> yang keren dan multifungsi.
              </h2>
              <p className="max-w-xl text-white/65">
                Login dulu untuk masuk. Setelah login, toko, keranjang, QRIS, dan menu admin bisa dibuka sesuai email.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <FiPackage className="mb-3 text-emerald-300" />
                  <div className="text-lg font-bold">Produk</div>
                  <div className="text-sm text-white/50">Script, jasa, panel</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <FiCreditCard className="mb-3 text-emerald-300" />
                  <div className="text-lg font-bold">QRIS</div>
                  <div className="text-sm text-white/50">Siap connect gateway</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <FiGrid className="mb-3 text-emerald-300" />
                  <div className="text-lg font-bold">Admin</div>
                  <div className="text-sm text-white/50">Hanya email admin</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-emerald-500/10">
              <h3 className="text-2xl font-bold">Login</h3>
              <p className="mt-2 text-white/55">Masukkan email Gmail untuk masuk.</p>
              <div className="mt-5 space-y-3">
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none"
                  placeholder="Nama"
                  value={login.name}
                  onChange={(e) => setLogin({ ...login, name: e.target.value })}
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none"
                  placeholder="Email Gmail"
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                />
                <button
                  onClick={loginUser}
                  className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black"
                >
                  Login
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Selamat datang, {user.name}</h2>
                  <p className="text-white/55">{user.email}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={contactAdmin} className="rounded-2xl bg-green-500 px-5 py-3 font-semibold text-black">
                    Hubungi Admin
                  </button>
                  <button onClick={logout} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold">
                    Logout
                  </button>
                </div>
              </div>
            </section>

            <section id="produk" className="mt-16">
              <div className="mb-6">
                <h3 className="text-3xl font-bold">Produk Unggulan</h3>
                <p className="text-white/55">Produk, jasa, dan item digital.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {filtered.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -6 }} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{p.tag}</span>
                      <span className="text-xs text-white/45">Stok: {p.stock}</span>
                    </div>
                    <h4 className="text-xl font-bold">{p.name}</h4>
                    <p className="mt-2 text-sm text-white/60">{p.desc}</p>
                    <div className="mt-3 text-xs text-white/45">{p.category} • {p.type}</div>
                    <div className="mt-4 flex items-center gap-2 text-emerald-300"><FiStar /><span className="text-sm">{p.rating}</span></div>
                    <div className="mt-4 text-2xl font-black text-white">{formatIDR(p.price)}</div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => changeStock(p.id, -1)} className="rounded-xl border border-white/10 bg-white/5 p-2"><FiMinus /></button>
                      <button onClick={() => changeStock(p.id, 1)} className="rounded-xl border border-white/10 bg-white/5 p-2"><FiPlus /></button>
                      <button onClick={() => addToCart(p)} className="ml-auto rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-black">Tambah</button>
                    </div>
                    <button onClick={() => setSelected(p)} className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80">Detail</button>
                  </motion.div>
                ))}
              </div>
            </section>

            {isAdmin && (
              <section id="admin" className="mt-16 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><FiLock /> Admin Panel</h3>
                  <p className="mt-2 text-white/60">Hanya muncul untuk email admin.</p>

                  <div className="mt-5 grid gap-3">
                    <input className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" placeholder="Nama barang" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" placeholder="Harga" type="number" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} />
                      <input className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" placeholder="Stok" type="number" value={form.stock} onChange={(e)=>setForm({...form, stock:e.target.value})} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})}>
                        <option>Script</option><option>Bot</option><option>Panel</option><option>Jasa</option><option>Lisensi</option><option>Custom</option>
                      </select>
                      <select className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}>
                        <option>Digital</option><option>Service</option><option>Physical</option>
                      </select>
                    </div>
                    <input className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" placeholder="Tag" value={form.tag} onChange={(e)=>setForm({...form, tag:e.target.value})} />
                    <textarea className="min-h-28 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 outline-none" placeholder="Deskripsi" value={form.desc} onChange={(e)=>setForm({...form, desc:e.target.value})} />
                    <button onClick={saveProduct} className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black">
                      {editId ? "Update Produk" : "Tambah Produk"}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-2xl font-bold">Manajemen Produk</h3>
                  <div className="mt-4 space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-sm text-white/50">{formatIDR(p.price)} • Stok {p.stock}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(p)} className="rounded-xl border border-white/10 bg-white/5 p-2"><FiEdit3 /></button>
                            <button onClick={() => removeProduct(p.id)} className="rounded-xl border border-white/10 bg-white/5 p-2"><FiTrash2 /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section id="qris" className="mt-16 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-2xl font-bold">Pembayaran QRIS</h3>
                <p className="mt-2 text-white/60">Nanti tinggal sambungkan ke payment gateway QRIS kamu.</p>
                <div className="mt-5 rounded-3xl border border-dashed border-emerald-400/40 bg-black/40 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-2xl bg-white text-black">
                    QRIS
                  </div>
                  <p className="text-sm text-white/55">Ganti area ini dengan QR dari gateway nanti.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-2xl font-bold">Checkout Otomatis</h3>
                <p className="mt-2 text-white/60">Order dibuat otomatis dari keranjang.</p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-black/40 p-4">Total: <b>{formatIDR(cartTotal)}</b></div>
                  <button onClick={() => checkout("QRIS")} className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black">
                    Bayar via QRIS
                  </button>
                  <button onClick={() => checkout("WhatsApp")} className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold">
                    Checkout via Admin
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-bold">Keranjang Belanja</h3>
              {cart.length === 0 ? (
                <p className="mt-3 text-white/55">Keranjang masih kosong.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-white/50">{formatIDR(item.price)} / item</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateCartQty(item.id, -1)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, 1)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">+</button>
                      </div>
                      <div className="font-bold text-emerald-300">{formatIDR(item.qty * item.price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="orders" className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-bold">Riwayat Order</h3>
              <div className="mt-4 space-y-3">
                {orders.length === 0 ? (
                  <p className="text-white/55">Belum ada order.</p>
                ) : orders.map(o => (
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold">{o.id}</div>
                        <div className="text-sm text-white/50">{o.user} • {o.method} • {o.status}</div>
                      </div>
                      <div className="font-bold text-emerald-300">{formatIDR(o.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">{selected.name}</h3>
                <p className="mt-2 text-white/60">{selected.desc}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 bg-white/5 p-2">
                <FiX />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="font-bold text-emerald-300">{selected.stock}</div>
                <div className="text-xs text-white/45">Stok</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="font-bold text-emerald-300">{selected.rating}</div>
                <div className="text-xs text-white/45">Rating</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="font-bold text-emerald-300">{selected.tag}</div>
                <div className="text-xs text-white/45">Tag</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => { addToCart(selected); setSelected(null); }} className="flex-1 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-black">
                Tambah ke Keranjang
              </button>
              <button onClick={contactAdmin} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white">
                Hubungi Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}