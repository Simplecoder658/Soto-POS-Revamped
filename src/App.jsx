import React, { useState, useEffect } from 'react';
import { fetchMenu, submitTransaction } from './api';

const App = () => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [category, setCategory] = useState('Makanan');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchMenu();
    setMenu(data);
    setLoading(false);
  };

  const updateCart = (item, delta) => {
    setCart(prev => {
      const newQty = (prev[item.nama]?.qty || 0) + delta;
      if (newQty <= 0) {
        const { [item.nama]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.nama]: { ...item, qty: newQty } };
    });
  };

  const totalHarga = Object.values(cart).reduce((sum, item) => sum + (item.harga * item.qty), 0);

  const handleCheckout = async () => {
    if (Object.keys(cart).length === 0) return;
    setIsSubmitting(true);
    
    const payload = {
      timestamp: new Date().toISOString(),
      items: Object.values(cart),
      total: totalHarga,
      kasir: "ADMIN"
    };

    const result = await submitTransaction(payload);
    if (result.success) {
      alert("Transaksi Berhasil, Sir.");
      setCart({});
    } else {
      alert("Gagal sinkronisasi ke database.");
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-amber-400 font-mono">INITIALIZING SYSTEM...</div>;

  const categories = [...new Set(menu.map(item => item.kategori))];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <header className="mb-6 border-b border-emerald-800 pb-4">
        <h1 className="text-2xl font-black text-amber-400 tracking-tighter">KEDAI RA-ME 23</h1>
        <p className="text-xs text-emerald-400 font-mono">OPERATOR: ADMIN | SECURE SESSION</p>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 no-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${category === cat ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-900 text-emerald-400 border border-emerald-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu.filter(item => item.kategori === category).map(item => (
          <div key={item.nama} className="bg-emerald-900/50 p-4 rounded-xl border border-emerald-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white">{item.nama}</h3>
              <p className="text-amber-400 text-sm font-mono">Rp {item.harga.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 bg-emerald-950 rounded-lg p-1">
              <button onClick={() => updateCart(item, -1)} className="w-8 h-8 flex items-center justify-center text-amber-400 hover:bg-emerald-800 rounded">-</button>
              <span className="w-4 text-center font-bold">{cart[item.nama]?.qty || 0}</span>
              <button onClick={() => updateCart(item, 1)} className="w-8 h-8 flex items-center justify-center text-amber-400 hover:bg-emerald-800 rounded">+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-emerald-950/90 backdrop-blur-md border-t border-emerald-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Total Bill</p>
            <p className="text-2xl font-black text-white">Rp {totalHarga.toLocaleString()}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isSubmitting || totalHarga === 0}
            className="bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 text-emerald-950 font-black px-8 py-3 rounded-xl transition-transform active:scale-95"
          >
            {isSubmitting ? "SINKRONISASI..." : "KONFIRMASI BAYAR"}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
