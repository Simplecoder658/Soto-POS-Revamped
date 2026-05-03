import React, { useState, useEffect } from 'react';
import { GSheets } from './api';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [shiftStatus, setShiftStatus] = useState("CLOSED");
  const [lastIndex, setLastIndex] = useState(0);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("Makanan");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await GSheets.init();
    if (data.status === "SUCCESS") {
      setMenu(data.menu);
      setAccounts(data.accounts);
      setShiftStatus(data.shiftStatus);
      setLastIndex(data.lastOrderIndex);
    }
    setLoading(false);
  };

  const handleLogin = (pin) => {
    const found = accounts.find(a => String(a.pin) === pin);
    if (found) setUser(found); else alert("PIN Salah!");
  };

  const currentNoNota = `KR-${String(lastIndex + 1).padStart(3, '0')}`;

  const processOrder = async (method) => {
    const total = cart.reduce((a, c) => a + (c.price * c.qty), 0);
    const payload = {
      noNota: currentNoNota,
      items: cart,
      total: total,
      method: method,
      user: user.username
    };

    setLoading(true);
    const res = await GSheets.saveOrder(payload);
    if (res.status === "SUCCESS") {
      setReceipt({...payload, time: new Date().toLocaleString()});
      setCart([]);
      setLastIndex(prev => prev + 1);
    }
    setLoading(false);
  };

  const toggleShift = async () => {
    const action = shiftStatus === "OPEN" ? "closeShift" : "openShift";
    if (action === "closeShift" && !confirm("Tutup Shift & Reset Nota?")) return;
    
    setLoading(true);
    await GSheets.updateShift(action);
    await loadData(); // Reload data setelah shift berubah
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-emerald-950 text-amber-400 font-black italic animate-pulse text-2xl">LOADING RA-ME...</div>;

  if (!user) return (
    <div className="h-screen bg-emerald-950 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-12 rounded-[4rem] w-full max-w-sm text-center shadow-2xl border-4 border-amber-400">
        <h1 className="text-3xl font-black text-emerald-900 mb-8 italic uppercase tracking-tighter">Login Kasir</h1>
        <input type="password" id="p" placeholder="••••" className="w-full p-5 mb-6 bg-gray-100 rounded-3xl text-center text-3xl font-black outline-none border-2 border-transparent focus:border-emerald-500" />
        <button onClick={() => handleLogin(document.getElementById('p').value)} className="w-full py-5 bg-emerald-800 text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest">Masuk</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar Navigasi */}
      <aside className="w-24 bg-emerald-900 flex flex-col items-center py-8 gap-4 border-r border-emerald-800 no-print">
        <div className="text-amber-400 font-black italic text-2xl mb-8">KR23</div>
        {[...new Set(menu.map(m => m.Category))].map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)} 
            className={`w-20 py-5 rounded-3xl font-black text-[9px] uppercase transition-all shadow-sm ${activeTab === cat ? 'bg-amber-400 text-emerald-900' : 'text-emerald-200 hover:bg-emerald-800'}`}>
            {cat}
          </button>
        ))}
        <button onClick={toggleShift} className={`mt-auto w-16 h-16 rounded-full font-black text-[8px] text-white ${shiftStatus === 'OPEN' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {shiftStatus === 'OPEN' ? 'CLOSE' : 'OPEN'}
        </button>
      </aside>

      {/* Grid Menu */}
      <main className="flex-1 flex flex-col no-print">
        <header className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-emerald-900 italic uppercase">{activeTab}</h2>
            <p className="text-[10px] text-gray-400 font-bold">KASIR: {user.username.toUpperCase()} | ROLE: {user.role.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-emerald-400 block uppercase">No. Nota</span>
            <span className="text-2xl font-black text-emerald-800 tracking-tighter">{currentNoNota}</span>
          </div>
        </header>

        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto bg-white">
          {shiftStatus === "CLOSED" ? (
            <div className="col-span-full py-40 text-center opacity-10 italic font-black text-5xl uppercase tracking-tighter">Shift Tertutup</div>
          ) : (
            menu.filter(m => m.Category === activeTab).map(m => (
              <div key={m.id} onClick={() => setCart([...cart, { ...m, qty: 1 }])} className="bg-gray-50 p-6 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center hover:border-amber-400 transition-all cursor-pointer active:scale-95 shadow-sm group">
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{m.img}</span>
                <h4 className="font-black text-emerald-950 text-[11px] uppercase leading-tight h-8">{m.name}</h4>
                <p className="text-emerald-600 font-black text-sm mt-2">Rp {m.price.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Keranjang Belanja */}
      <section className="w-96 bg-gray-50 border-l flex flex-col no-print shadow-2xl">
        <div className="p-6 bg-emerald-950 text-white font-black italic uppercase text-xs flex justify-between tracking-[0.2em]">
          <span>Pesanan</span>
          <button onClick={() => setCart([])} className="text-amber-400 text-[10px]">Reset</button>
        </div>
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-300 font-black italic uppercase text-xs">Kosong</div>
          ) : cart.map((it, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl flex justify-between items-center shadow-sm border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-emerald-950">{it.name}</span>
                <span className="text-[9px] text-emerald-500 font-bold">x1 @ {it.price.toLocaleString()}</span>
              </div>
              <span className="font-black text-emerald-800 text-xs">{it.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="p-8 bg-white border-t-2 border-emerald-50 space-y-6">
          <div className="flex justify-between font-black text-3xl text-emerald-950 italic tracking-tighter">
            <span>TOTAL</span>
            <span>{cart.reduce((a,c) => a+(c.price*c.qty),0).toLocaleString()}</span>
          </div>
          <button onClick={() => processOrder('Tunai')} disabled={cart.length === 0} className="w-full py-6 bg-emerald-800 text-white rounded-[2.5rem] font-black uppercase shadow-2xl active:scale-95 transition-all text-sm tracking-widest disabled:bg-gray-200">Konfirmasi Bayar</button>
        </div>
      </section>

      {/* Struk Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-emerald-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-xs text-center shadow-2xl font-mono text-[10px] receipt-to-print border-t-[12px] border-amber-400">
            <h2 className="font-black text-lg text-emerald-900 leading-none">RA-ME 23</h2>
            <p className="text-[7px] uppercase font-bold tracking-widest mb-4">Soto Singkong Resep Ibu</p>
            <div className="border-t border-dashed border-gray-300 my-4"></div>
            {receipt.items.map((it, i) => (
              <div key={i} className="flex justify-between mb-1 uppercase"><span>{it.name}</span><span>{it.price.toLocaleString()}</span></div>
            ))}
            <div className="border-t border-dashed border-gray-300 my-4"></div>
            <div className="flex justify-between font-black text-sm italic uppercase text-emerald-900"><span>Total</span><span>{receipt.total.toLocaleString()}</span></div>
            <div className="mt-8 text-[7px] opacity-50 uppercase font-bold">
              ID: {receipt.noNota} | {receipt.time} <br /> KASIR: {receipt.user}
            </div>
            <div className="mt-8 flex gap-2 no-print">
              <button onClick={() => window.print()} className="flex-1 py-4 bg-emerald-800 text-white rounded-2xl font-black">PRINT</button>
              <button onClick={() => setReceipt(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black">TUTUP</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-to-print, .receipt-to-print * { visibility: visible; }
          .receipt-to-print { position: fixed; left: 0; top: 0; width: 100%; border: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
