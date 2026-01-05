import { useState } from 'react';
import Head from 'next/head';
import { useStore, formatPrice, getCategoryName } from '../lib/store';

// ===== Header =====
const Header = ({ onNav, cartCount, view }) => (
  <header className="bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div onClick={() => onNav('home')} className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg">肉</div>
        <div>
          <div className="text-white text-xl font-bold tracking-wide">御選精肉</div>
          <div className="text-accent text-xs tracking-widest">PREMIUM MEAT</div>
        </div>
      </div>
      <nav className="hidden md:flex gap-1">
        {[['home', '首頁'], ['products', '商品'], ['admin', '後台']].map(([k, v]) => (
          <button key={k} onClick={() => onNav(k)} className={`px-5 py-2 rounded-lg transition ${view === k ? 'text-accent border-b-2 border-accent' : 'text-white hover:text-accent'}`}>{v}</button>
        ))}
      </nav>
      <button onClick={() => onNav('cart')} className="relative w-12 h-12 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition shadow-lg">
        <span className="text-white text-lg">🛒</span>
        {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
      </button>
    </div>
  </header>
);

// ===== Hero =====
const Hero = ({ onNav }) => (
  <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center" style={{ background: 'linear-gradient(135deg,rgba(26,26,26,0.9),rgba(45,45,45,0.7)),url(https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1920) center/cover' }}>
    <div className="px-4">
      <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-4 leading-tight">
        嚴選世界頂級<br /><span className="text-accent">精品肉舖</span>
      </h1>
      <p className="text-white/80 text-lg mb-8">從牧場到餐桌，為您呈獻最純粹的美味體驗</p>
      <button onClick={() => onNav('products')} className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:shadow-xl transition transform hover:-translate-y-1">
        探索商品 →
      </button>
    </div>
  </section>
);

// ===== Product Card =====
const ProductCard = ({ product, onAdd, onView }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
    <div className="relative aspect-[4/3] bg-gray-100">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      {product.featured && <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">精選</span>}
      {product.stock < 10 && product.stock > 0 && <span className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">庫存有限</span>}
    </div>
    <div className="p-5">
      <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{getCategoryName(product.category)}</div>
      <h3 className="text-lg font-bold mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{product.nameEn}</p>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
        <span className="text-sm text-gray-400">庫存: {product.stock}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onView(product)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">查看</button>
        <button onClick={() => onAdd(product)} disabled={product.stock === 0} className={`flex-1 py-2 rounded-lg transition ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}>
          加入
        </button>
      </div>
    </div>
  </div>
);

// ===== Quick View Modal =====
const QuickViewModal = ({ product, onClose, onAdd }) => {
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="text-2xl font-bold text-primary mb-2">{formatPrice(product.price)}</div>
        <p className="text-gray-500 mb-4">庫存：{product.stock} {product.unit}</p>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 bg-gray-100 rounded-lg text-xl hover:bg-gray-200">−</button>
          <span className="text-xl font-semibold w-8 text-center">{qty}</span>
          <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 bg-gray-100 rounded-lg text-xl hover:bg-gray-200">+</button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">關閉</button>
          <button onClick={() => { onAdd(product, qty); onClose(); }} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-semibold">加入購物車</button>
        </div>
      </div>
    </div>
  );
};

// ===== Cart View =====
const CartView = ({ cart, setCart, onCheckout }) => {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  
  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl opacity-50 mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">購物車是空的</h2>
        <p className="text-gray-500">快去選購美味的肉品吧！</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">購物車</h1>
      <div className="space-y-3">
        {cart.map(item => (
          <div key={item.product.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <img src={item.product.image} alt={item.product.name} className="w-20 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <span className="text-primary font-semibold">{formatPrice(item.product.price)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCart(prev => item.quantity <= 1 ? prev.filter(i => i.product.id !== item.product.id) : prev.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i))} className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200">−</button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: Math.min(i.quantity + 1, item.product.stock) } : i))} className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200">+</button>
            </div>
            <div className="font-bold min-w-[100px] text-right">{formatPrice(item.product.price * item.quantity)}</div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">總計</span>
          <span className="text-3xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <button onClick={onCheckout} className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:shadow-lg transition">
          前往結帳 →
        </button>
      </div>
    </div>
  );
};

// ===== Inventory Modal =====
const InventoryModal = ({ product, onClose }) => {
  const store = useStore();
  const [change, setChange] = useState('');
  const [type, setType] = useState('in');
  const [note, setNote] = useState('');

  const currentProduct = store.getProducts().find(p => p.id === product.id) || product;
  const changeNum = Number(change) || 0;
  const actualChange = type === 'out' ? -Math.abs(changeNum) : Math.abs(changeNum);
  const newStock = currentProduct.stock + actualChange;
  const isValid = change && changeNum > 0 && newStock >= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      store.updateInventory(currentProduct.id, actualChange, type, note);
      onClose();
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-1">📦 調整庫存</h2>
        <p className="text-lg font-semibold">{currentProduct.name}</p>
        <p className="text-gray-500 mb-4">目前庫存：<strong className="text-primary">{currentProduct.stock} {currentProduct.unit}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">異動類型</label>
            <div className="grid grid-cols-3 gap-2">
              {[['in', '📥 進貨'], ['out', '📤 出貨'], ['adjust', '📋 盤點']].map(([k, v]) => (
                <button key={k} type="button" onClick={() => setType(k)} className={`py-3 rounded-lg transition ${type === k ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{v}</button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold">數量 *</label>
            <input type="number" value={change} onChange={e => setChange(e.target.value)} min="1" placeholder="輸入數量" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold">備註</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="例：供應商補貨" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" />
          </div>
          
          {change && changeNum > 0 && (
            <div className={`p-4 rounded-xl mb-4 text-center ${newStock < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="text-gray-600 text-sm">調整後庫存</div>
              <div className={`text-2xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-green-600'}`}>{newStock} {currentProduct.unit}</div>
              {newStock < 0 && <div className="text-red-600 text-sm mt-1">⚠️ 庫存不足</div>}
            </div>
          )}
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">取消</button>
            <button type="submit" disabled={!isValid} className={`flex-1 py-3 rounded-xl transition font-semibold ${isValid ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}>✓ 確認</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Product Modal =====
const ProductModal = ({ product, onClose }) => {
  const store = useStore();
  const [form, setForm] = useState(product || { name: '', nameEn: '', category: 'beef', price: '', stock: '', unit: '', description: '', image: '', featured: false });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    if (product) store.updateProduct(product.id, data);
    else store.addProduct(data);
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-lg w-full my-8">
        <h2 className="text-xl font-bold mb-4">{product ? '編輯商品' : '新增商品'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-sm">商品名稱*</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">英文名稱</label>
              <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-sm">分類*</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none">
                <option value="beef">牛肉</option>
                <option value="pork">豬肉</option>
                <option value="poultry">禽肉</option>
                <option value="lamb">羊肉</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">單位*</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="如：200g" required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-sm">價格 (NT$)*</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-sm">庫存*</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">圖片網址</label>
            <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
            <span>設為精選商品</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition">取消</button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-semibold">儲存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Admin Panel =====
const AdminPanel = () => {
  const store = useStore();
  const [tab, setTab] = useState('inventory');
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invModal, setInvModal] = useState(null);

  const products = store.getProducts();
  const orders = store.getOrders();
  const inventoryLog = store.getInventoryLog();
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 20).length;

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-52 bg-gray-900 p-4">
        <h2 className="text-white font-bold mb-4 pb-3 border-b border-gray-700">後台管理</h2>
        <nav className="space-y-1">
          {[['inventory', '📊 進銷存'], ['products', '📦 商品'], ['orders', '📋 訂單']].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} className={`w-full text-left px-3 py-2 rounded-lg transition ${tab === k ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{v}</button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* 進銷存 */}
        {tab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 進銷存管理</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">📦</div><div className="text-2xl font-bold">{products.length}</div><div className="text-gray-500 text-sm">商品種類</div></div>
              <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">💰</div><div className="text-lg font-bold">{formatPrice(totalValue)}</div><div className="text-gray-500 text-sm">庫存價值</div></div>
              <div className={`bg-white p-4 rounded-xl shadow-sm ${lowStock > 0 ? 'border-l-4 border-orange-500' : ''}`}><div className="text-2xl mb-1">⚠️</div><div className={`text-2xl font-bold ${lowStock > 0 ? 'text-orange-500' : ''}`}>{lowStock}</div><div className="text-gray-500 text-sm">低庫存</div></div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">商品</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">庫存</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">價值</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">狀態</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">操作</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className={`border-t ${p.stock < 20 ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3"><span className={`font-bold ${p.stock < 10 ? 'text-red-600' : p.stock < 20 ? 'text-orange-500' : ''}`}>{p.stock}</span> {p.unit}</td>
                      <td className="px-4 py-3">{formatPrice(p.price * p.stock)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock < 10 ? 'bg-red-100 text-red-600' : p.stock < 20 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{p.stock < 10 ? '緊急' : p.stock < 20 ? '偏低' : '正常'}</span></td>
                      <td className="px-4 py-3"><button onClick={() => setInvModal(p)} className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition">調整庫存</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {inventoryLog.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-3">異動紀錄</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">時間</th><th className="px-4 py-2 text-left">商品</th><th className="px-4 py-2 text-left">類型</th><th className="px-4 py-2 text-left">數量</th><th className="px-4 py-2 text-left">備註</th></tr></thead>
                    <tbody>
                      {inventoryLog.slice().reverse().slice(0, 10).map(log => {
                        const prod = products.find(x => x.id === log.productId);
                        return (
                          <tr key={log.id} className="border-t">
                            <td className="px-4 py-2 text-gray-500">{new Date(log.timestamp).toLocaleString('zh-TW')}</td>
                            <td className="px-4 py-2">{prod?.name || '已刪除'}</td>
                            <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs ${log.type === 'in' ? 'bg-green-100 text-green-600' : log.type === 'out' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{log.type === 'in' ? '進貨' : log.type === 'out' ? '出貨' : '盤點'}</span></td>
                            <td className={`px-4 py-2 font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{log.change > 0 ? '+' : ''}{log.change}</td>
                            <td className="px-4 py-2 text-gray-500">{log.note || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 商品管理 */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📦 商品管理</h2>
              <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">+ 新增商品</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">商品</th><th className="px-4 py-3 text-left">分類</th><th className="px-4 py-3 text-left">價格</th><th className="px-4 py-3 text-left">庫存</th><th className="px-4 py-3 text-left">操作</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3"><div className="font-semibold">{p.name}</div><div className="text-sm text-gray-500">{p.nameEn}</div></td>
                      <td className="px-4 py-3">{getCategoryName(p.category)}</td>
                      <td className="px-4 py-3">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">✏️</button>
                        <button onClick={() => { if (confirm('確定刪除？')) store.deleteProduct(p.id); }} className="px-2 py-1 bg-red-50 rounded hover:bg-red-100">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 訂單管理 */}
        {tab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📋 訂單管理</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">尚無訂單</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">訂單編號</th><th className="px-4 py-3 text-left">日期</th><th className="px-4 py-3 text-left">商品</th><th className="px-4 py-3 text-left">金額</th></tr></thead>
                  <tbody>
                    {orders.slice().reverse().map(o => (
                      <tr key={o.id} className="border-t">
                        <td className="px-4 py-3 font-semibold">{o.id}</td>
                        <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString('zh-TW')}</td>
                        <td className="px-4 py-3">{o.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</td>
                        <td className="px-4 py-3 font-bold text-primary">{formatPrice(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} />}
      {invModal && <InventoryModal product={invModal} onClose={() => setInvModal(null)} />}
    </div>
  );
};

// ===== Footer =====
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold">肉</div>
          <span className="text-xl font-bold">御選精肉</span>
        </div>
        <p className="text-gray-400">嚴選世界頂級肉品，為您呈獻最純粹的美味體驗</p>
      </div>
      <div>
        <h4 className="text-accent font-semibold mb-3">聯絡我們</h4>
        <p className="text-gray-400">📞 02-1234-5678</p>
        <p className="text-gray-400">📧 info@meatshop.com</p>
      </div>
      <div>
        <h4 className="text-accent font-semibold mb-3">營業時間</h4>
        <p className="text-gray-400">週一至週六 10:00 - 20:00</p>
        <p className="text-gray-400">週日 11:00 - 18:00</p>
      </div>
    </div>
    <div className="text-center text-gray-500 text-sm mt-8 pt-8 border-t border-gray-800">
      © 2026 御選精肉 Premium Meat Selection
    </div>
  </footer>
);

// ===== Main Page =====
export default function Home() {
  const store = useStore();
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [category, setCategory] = useState(null);
  const [notif, setNotif] = useState(null);

  const products = store.getProducts();
  const categories = [{ id: 'beef', name: '牛肉', icon: '🥩' }, { id: 'pork', name: '豬肉', icon: '🐷' }, { id: 'poultry', name: '禽肉', icon: '🐔' }, { id: 'lamb', name: '羊肉', icon: '🐑' }];
  const filtered = category ? products.filter(p => p.category === category) : products;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const showNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 2500); };

  const addToCart = (p, qty = 1) => {
    const currentP = store.getProducts().find(x => x.id === p.id);
    if (!currentP || currentP.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, quantity: Math.min(i.quantity + qty, currentP.stock) } : i);
      return [...prev, { product: currentP, quantity: Math.min(qty, currentP.stock) }];
    });
    showNotif(`✓ 已加入 ${p.name}`);
  };

  const checkout = () => {
    store.createOrder({
      items: cart.map(i => ({ productId: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
      total: cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
    });
    setCart([]);
    showNotif('🎉 訂單已成功送出！');
    setView('home');
  };

  return (
    <>
      <Head>
        <title>御選精肉 | Premium Meat Selection</title>
        <meta name="description" content="嚴選世界頂級肉品，為您呈獻最純粹的美味體驗" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5]">
        <Header onNav={setView} cartCount={cartCount} view={view} />
        
        {notif && <div className="fixed top-24 right-4 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg z-50 animate-slide-in">{notif}</div>}

        <main>
          {view === 'home' && (
            <>
              <Hero onNav={setView} />
              <section className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-10">精選商品</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.filter(p => p.featured).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={setQuickView} />)}
                </div>
              </section>
            </>
          )}

          {view === 'products' && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-6">{category ? getCategoryName(category) : '所有商品'}</h1>
              <div className="flex flex-wrap gap-2 mb-8">
                <button onClick={() => setCategory(null)} className={`px-4 py-2 rounded-full transition ${!category ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}>全部</button>
                {categories.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`px-4 py-2 rounded-full transition ${category === c.id ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}>{c.icon} {c.name}</button>)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={setQuickView} />)}
              </div>
            </section>
          )}

          {view === 'cart' && <CartView cart={cart} setCart={setCart} onCheckout={checkout} />}
          {view === 'admin' && <AdminPanel />}
        </main>

        {view !== 'admin' && <Footer />}
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />}
      </div>
    </>
  );
}
