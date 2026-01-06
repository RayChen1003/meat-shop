import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useStore, formatPrice, getCategoryName } from '../lib/store';

// ===== 後台帳密設定 =====
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'meat2024'  // 請自行修改密碼
};

// ===== Loading 組件 =====
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">載入中...</p>
    </div>
  </div>
);

// ===== Error 組件 =====
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 mb-4">{message}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
        重試
      </button>
    </div>
  </div>
);

// ===== Header (RWD 優化) =====
const Header = ({ onNav, cartCount, view }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div onClick={() => { onNav('home'); setMenuOpen(false); }} className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-90 transition">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">肉</div>
          <div>
            <div className="text-white text-base sm:text-xl font-bold tracking-wide">御選精肉</div>
            <div className="text-accent text-[10px] sm:text-xs tracking-widest hidden sm:block">PREMIUM MEAT</div>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1">
          {[['home', '首頁'], ['products', '商品'], ['admin', '後台']].map(([k, v]) => (
            <button key={k} onClick={() => onNav(k)} className={`px-4 lg:px-5 py-2 rounded-lg transition ${view === k ? 'text-accent border-b-2 border-accent' : 'text-white hover:text-accent'}`}>{v}</button>
          ))}
        </nav>
        
        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button */}
          <button onClick={() => { onNav('cart'); setMenuOpen(false); }} className="relative w-10 h-10 sm:w-12 sm:h-12 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition shadow-lg">
            <span className="text-white text-base sm:text-lg">🛒</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 bg-accent text-gray-900 text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center px-1">{cartCount}</span>}
          </button>
          
          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          {[['home', '🏠 首頁'], ['products', '🥩 商品'], ['admin', '⚙️ 後台管理']].map(([k, v]) => (
            <button key={k} onClick={() => { onNav(k); setMenuOpen(false); }} className={`w-full text-left px-6 py-4 border-b border-gray-700 transition ${view === k ? 'text-accent bg-gray-700' : 'text-white hover:bg-gray-700'}`}>{v}</button>
          ))}
        </div>
      )}
    </header>
  );
};

// ===== Hero (RWD 優化) =====
const Hero = ({ onNav }) => (
  <section className="relative h-[50vh] sm:h-[60vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center text-center" style={{ background: 'linear-gradient(135deg,rgba(26,26,26,0.9),rgba(45,45,45,0.7)),url(https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1920) center/cover' }}>
    <div className="px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 leading-tight">
        嚴選世界頂級<br /><span className="text-accent">精品肉舖</span>
      </h1>
      <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">從牧場到餐桌，為您呈獻最純粹的美味體驗</p>
      <button onClick={() => onNav('products')} className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:shadow-xl transition transform hover:-translate-y-1 text-sm sm:text-base">
        探索商品 →
      </button>
    </div>
  </section>
);

// ===== Product Card (RWD 優化) =====
const ProductCard = ({ product, onAdd, onView }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 sm:hover:-translate-y-2">
    <div className="relative aspect-[4/3] bg-gray-100">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
      {product.featured && <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-white text-[10px] sm:text-xs font-semibold rounded-full">精選</span>}
      {product.stock < 10 && product.stock > 0 && <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">庫存有限</span>}
      {product.stock === 0 && <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">已售完</span>}
    </div>
    <div className="p-3 sm:p-5">
      <div className="text-[10px] sm:text-xs text-primary font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">{getCategoryName(product.category)}</div>
      <h3 className="text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 line-clamp-1">{product.name}</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 hidden sm:block">{product.nameEn}</p>
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <span className="text-base sm:text-xl font-bold text-primary">{formatPrice(product.price)}</span>
        <span className="text-[10px] sm:text-sm text-gray-400">庫存: {product.stock}</span>
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        <button onClick={() => onView(product)} className="flex-1 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs sm:text-sm">查看</button>
        <button onClick={() => onAdd(product)} disabled={product.stock === 0} className={`flex-1 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}>
          加入
        </button>
      </div>
    </div>
  </div>
);

// ===== Quick View Modal (RWD 優化) =====
const QuickViewModal = ({ product, onClose, onAdd }) => {
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
        <img src={product.image} alt={product.name} className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl mb-3 sm:mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{product.name}</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{product.description}</p>
        <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">{formatPrice(product.price)}</div>
        <p className="text-gray-500 text-sm mb-3 sm:mb-4">庫存：{product.stock} {product.unit}</p>
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg text-lg sm:text-xl hover:bg-gray-200">−</button>
          <span className="text-lg sm:text-xl font-semibold w-8 text-center">{qty}</span>
          <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg text-lg sm:text-xl hover:bg-gray-200">+</button>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm sm:text-base">關閉</button>
          <button onClick={() => { onAdd(product, qty); onClose(); }} disabled={product.stock === 0} className={`flex-1 py-2.5 sm:py-3 rounded-xl transition font-semibold text-sm sm:text-base ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}>加入購物車</button>
        </div>
      </div>
    </div>
  );
};

// ===== Cart View (RWD 優化) =====
const CartView = ({ cart, setCart, onCheckout, loading }) => {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  
  if (cart.length === 0) {
    return (
      <div className="text-center py-16 sm:py-20 px-4">
        <div className="text-5xl sm:text-6xl opacity-50 mb-3 sm:mb-4">🛒</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">購物車是空的</h2>
        <p className="text-gray-500 text-sm sm:text-base">快去選購美味的肉品吧！</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">購物車</h1>
      <div className="space-y-2 sm:space-y-3">
        {cart.map(item => (
          <div key={item.product.id} className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
            <img src={item.product.image} alt={item.product.name} className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">{item.product.name}</h3>
              <span className="text-primary font-semibold text-sm sm:text-base">{formatPrice(item.product.price)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button onClick={() => setCart(prev => item.quantity <= 1 ? prev.filter(i => i.product.id !== item.product.id) : prev.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity - 1 } : i))} className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded hover:bg-gray-200 text-sm">−</button>
              <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
              <button onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, quantity: Math.min(i.quantity + 1, item.product.stock) } : i))} className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded hover:bg-gray-200 text-sm">+</button>
            </div>
            <div className="font-bold text-sm sm:text-base min-w-[70px] sm:min-w-[100px] text-right hidden sm:block">{formatPrice(item.product.price * item.quantity)}</div>
          </div>
        ))}
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mt-3 sm:mt-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <span className="text-base sm:text-lg">總計</span>
          <span className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <button onClick={onCheckout} disabled={loading} className={`w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {loading ? '處理中...' : '前往結帳 →'}
        </button>
      </div>
    </div>
  );
};

// ===== Login Modal =====
const LoginModal = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin();
    } else {
      setError('帳號或密碼錯誤');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-8 animate-slide-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">🔐</div>
          <h2 className="text-xl sm:text-2xl font-bold">後台登入</h2>
          <p className="text-gray-500 text-sm mt-1">請輸入管理員帳號密碼</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 font-semibold text-sm">帳號</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="輸入帳號"
              required 
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition" 
            />
          </div>
          
          <div>
            <label className="block mb-1.5 font-semibold text-sm">密碼</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="輸入密碼"
                required 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition pr-12" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center">
              ⚠️ {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-medium">
              取消
            </button>
            <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-semibold">
              登入
            </button>
          </div>
        </form>
        
        <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
          預設帳號：admin / 密碼：meat2024
        </div>
      </div>
    </div>
  );
};

// ===== Inventory Modal =====
const InventoryModal = ({ product, onClose, onSave }) => {
  const [change, setChange] = useState('');
  const [type, setType] = useState('in');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const changeNum = Number(change) || 0;
  const actualChange = type === 'out' ? -Math.abs(changeNum) : Math.abs(changeNum);
  const newStock = product.stock + actualChange;
  const isValid = change && changeNum > 0 && newStock >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid) {
      setSaving(true);
      try {
        await onSave(product.id, actualChange, type, note);
        onClose();
      } catch (err) {
        alert('儲存失敗：' + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-1">📦 調整庫存</h2>
        <p className="text-base sm:text-lg font-semibold">{product.name}</p>
        <p className="text-gray-500 text-sm mb-4">目前庫存：<strong className="text-primary">{product.stock} {product.unit}</strong></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">異動類型</label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {[['in', '📥 進貨'], ['out', '📤 出貨'], ['adjust', '📋 盤點']].map(([k, v]) => (
                <button key={k} type="button" onClick={() => setType(k)} className={`py-2 sm:py-3 rounded-lg transition text-xs sm:text-sm ${type === k ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{v}</button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">數量 *</label>
            <input type="number" value={change} onChange={e => setChange(e.target.value)} min="1" placeholder="輸入數量" required className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">備註</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="例：供應商補貨" className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" />
          </div>
          
          {change && changeNum > 0 && (
            <div className={`p-3 sm:p-4 rounded-xl mb-4 text-center ${newStock < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="text-gray-600 text-xs sm:text-sm">調整後庫存</div>
              <div className={`text-xl sm:text-2xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-green-600'}`}>{newStock} {product.unit}</div>
              {newStock < 0 && <div className="text-red-600 text-xs sm:text-sm mt-1">⚠️ 庫存不足</div>}
            </div>
          )}
          
          <div className="flex gap-2 sm:gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm">取消</button>
            <button type="submit" disabled={!isValid || saving} className={`flex-1 py-2.5 sm:py-3 rounded-xl transition font-semibold text-sm ${isValid && !saving ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}>
              {saving ? '儲存中...' : '✓ 確認'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Product Modal =====
const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(product || { name: '', nameEn: '', category: 'beef', price: '', stock: '', unit: '', description: '', image: '', featured: false });
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
      await onSave(product?.id, data);
      onClose();
    } catch (err) {
      alert('儲存失敗：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{product ? '編輯商品' : '新增商品'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">商品名稱*</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">英文名稱</label>
              <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">分類*</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm">
                <option value="beef">牛肉</option>
                <option value="pork">豬肉</option>
                <option value="poultry">禽肉</option>
                <option value="lamb">羊肉</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">單位*</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="如：200g" required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">價格 (NT$)*</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-xs sm:text-sm">庫存*</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-xs sm:text-sm">圖片網址</label>
            <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-xs sm:text-sm">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm">設為精選商品</span>
          </label>
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm">取消</button>
            <button type="submit" disabled={saving} className={`flex-1 py-2.5 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition font-semibold text-sm ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Admin Panel (RWD 優化 + 登入驗證) =====
const AdminPanel = ({ store, onLogout }) => {
  const [tab, setTab] = useState('inventory');
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invModal, setInvModal] = useState(null);

  const { products, orders, inventoryLog, loading, error, reload, addProduct, updateProduct, deleteProduct, updateInventory } = store;
  
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 20).length;

  const handleSaveProduct = async (id, data) => {
    if (id) {
      await updateProduct(id, data);
    } else {
      await addProduct(data);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('確定刪除？')) {
      await deleteProduct(id);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-80px)]">
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-gray-900 overflow-x-auto">
        {[['inventory', '📊'], ['products', '📦'], ['orders', '📋']].map(([k, icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 py-3 text-center transition ${tab === k ? 'bg-primary text-white' : 'text-gray-400'}`}>
            <span className="text-lg">{icon}</span>
          </button>
        ))}
        <button onClick={onLogout} className="px-4 py-3 text-red-400 hover:text-red-300">
          🚪
        </button>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-52 bg-gray-900 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
          <h2 className="text-white font-bold">後台管理</h2>
          <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-sm" title="登出">🚪</button>
        </div>
        <nav className="space-y-1">
          {[['inventory', '📊 進銷存'], ['products', '📦 商品'], ['orders', '📋 訂單']].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${tab === k ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{v}</button>
          ))}
        </nav>
        <button onClick={reload} className="w-full mt-4 px-3 py-2 text-gray-400 hover:text-white text-sm text-left">
          🔄 重新整理
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-auto bg-[#faf8f5]">
        {/* 進銷存 */}
        {tab === 'inventory' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">📊 進銷存管理</h2>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">📦</div>
                <div className="text-lg sm:text-2xl font-bold">{products.length}</div>
                <div className="text-gray-500 text-[10px] sm:text-sm">商品種類</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">💰</div>
                <div className="text-sm sm:text-lg font-bold">{formatPrice(totalValue)}</div>
                <div className="text-gray-500 text-[10px] sm:text-sm">庫存價值</div>
              </div>
              <div className={`bg-white p-3 sm:p-4 rounded-xl shadow-sm ${lowStock > 0 ? 'border-l-4 border-orange-500' : ''}`}>
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">⚠️</div>
                <div className={`text-lg sm:text-2xl font-bold ${lowStock > 0 ? 'text-orange-500' : ''}`}>{lowStock}</div>
                <div className="text-gray-500 text-[10px] sm:text-sm">低庫存</div>
              </div>
            </div>
            
            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4 sm:mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">商品</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">庫存</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 hidden sm:table-cell">價值</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">狀態</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={`border-t ${p.stock < 20 ? 'bg-yellow-50' : ''}`}>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">{p.name}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <span className={`font-bold ${p.stock < 10 ? 'text-red-600' : p.stock < 20 ? 'text-orange-500' : ''}`}>{p.stock}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{formatPrice(p.price * p.stock)}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${p.stock < 10 ? 'bg-red-100 text-red-600' : p.stock < 20 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {p.stock < 10 ? '緊急' : p.stock < 20 ? '偏低' : '正常'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <button onClick={() => setInvModal(p)} className="px-2 sm:px-3 py-1 bg-primary text-white text-[10px] sm:text-sm rounded-lg hover:bg-primary-dark transition">調整</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Log */}
            {inventoryLog.length > 0 && (
              <>
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">異動紀錄</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left">時間</th>
                          <th className="px-2 sm:px-4 py-2 text-left">商品</th>
                          <th className="px-2 sm:px-4 py-2 text-left">類型</th>
                          <th className="px-2 sm:px-4 py-2 text-left">數量</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryLog.slice(0, 10).map(log => {
                          const prod = products.find(x => x.id === log.productId);
                          return (
                            <tr key={log.id} className="border-t">
                              <td className="px-2 sm:px-4 py-2 text-gray-500 text-[10px] sm:text-xs">{new Date(log.timestamp).toLocaleDateString('zh-TW')}</td>
                              <td className="px-2 sm:px-4 py-2">{prod?.name || '已刪除'}</td>
                              <td className="px-2 sm:px-4 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${log.type === 'in' ? 'bg-green-100 text-green-600' : log.type === 'out' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {log.type === 'in' ? '進' : log.type === 'out' ? '出' : '盤'}
                                </span>
                              </td>
                              <td className={`px-2 sm:px-4 py-2 font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{log.change > 0 ? '+' : ''}{log.change}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 商品管理 */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">📦 商品管理</h2>
              <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-xs sm:text-sm">+ 新增</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">商品</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm hidden sm:table-cell">分類</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">價格</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">庫存</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div className="font-semibold text-xs sm:text-sm">{p.name}</div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{getCategoryName(p.category)}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{formatPrice(p.price)}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{p.stock}</td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 space-x-1 sm:space-x-2">
                          <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="px-1.5 sm:px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs sm:text-sm">✏️</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="px-1.5 sm:px-2 py-1 bg-red-50 rounded hover:bg-red-100 text-xs sm:text-sm">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 訂單管理 */}
        {tab === 'orders' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">📋 訂單管理</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">尚無訂單</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">訂單</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm hidden sm:table-cell">日期</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">商品</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm">金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-t">
                          <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">{o.id.replace('ORD-', '').slice(-6)}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{new Date(o.createdAt).toLocaleDateString('zh-TW')}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">{o.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 font-bold text-primary text-xs sm:text-sm">{formatPrice(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={handleSaveProduct} />}
      {invModal && <InventoryModal product={invModal} onClose={() => setInvModal(null)} onSave={updateInventory} />}
    </div>
  );
};

// ===== Footer (RWD 優化) =====
const Footer = () => (
  <footer className="bg-gray-900 text-white py-8 sm:py-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
      <div>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">肉</div>
          <span className="text-lg sm:text-xl font-bold">御選精肉</span>
        </div>
        <p className="text-gray-400 text-sm">嚴選世界頂級肉品，為您呈獻最純粹的美味體驗</p>
      </div>
      <div>
        <h4 className="text-accent font-semibold mb-2 sm:mb-3 text-sm sm:text-base">聯絡我們</h4>
        <p className="text-gray-400 text-sm">📞 02-1234-5678</p>
        <p className="text-gray-400 text-sm">📧 info@meatshop.com</p>
      </div>
      <div>
        <h4 className="text-accent font-semibold mb-2 sm:mb-3 text-sm sm:text-base">營業時間</h4>
        <p className="text-gray-400 text-sm">週一至週六 10:00 - 20:00</p>
        <p className="text-gray-400 text-sm">週日 11:00 - 18:00</p>
      </div>
    </div>
    <div className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800">
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { products, loading, error, reload, createOrder } = store;
  
  const categories = [{ id: 'beef', name: '牛肉', icon: '🥩' }, { id: 'pork', name: '豬肉', icon: '🐷' }, { id: 'poultry', name: '禽肉', icon: '🐔' }, { id: 'lamb', name: '羊肉', icon: '🐑' }];
  const filtered = category ? products.filter(p => p.category === category) : products;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const showNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(null), 2500); };

  const handleNav = (target) => {
    if (target === 'admin') {
      if (isAdminLoggedIn) {
        setView('admin');
      } else {
        setShowLoginModal(true);
      }
    } else {
      setView(target);
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setView('admin');
    showNotif('✓ 登入成功');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setView('home');
    showNotif('已登出後台');
  };

  const addToCart = (p, qty = 1) => {
    const currentP = products.find(x => x.id === p.id);
    if (!currentP || currentP.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id);
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, quantity: Math.min(i.quantity + qty, currentP.stock) } : i);
      return [...prev, { product: currentP, quantity: Math.min(qty, currentP.stock) }];
    });
    showNotif(`✓ 已加入 ${p.name}`);
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      await createOrder({
        items: cart.map(i => ({ productId: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity })),
        total: cart.reduce((s, i) => s + i.product.price * i.quantity, 0)
      });
      setCart([]);
      showNotif('🎉 訂單已成功送出！');
      setView('home');
    } catch (err) {
      alert('訂單送出失敗：' + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>御選精肉 | Premium Meat Selection</title>
        <meta name="description" content="嚴選世界頂級肉品，為您呈獻最純粹的美味體驗" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5]">
        <Header onNav={handleNav} cartCount={cartCount} view={view} />
        
        {notif && <div className="fixed top-20 sm:top-24 right-3 sm:right-4 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg shadow-lg z-50 animate-slide-in text-sm sm:text-base">{notif}</div>}

        <main>
          {loading && view !== 'admin' && <LoadingSpinner />}
          {error && view !== 'admin' && <ErrorMessage message={error} onRetry={reload} />}
          
          {!loading && !error && view === 'home' && (
            <>
              <Hero onNav={handleNav} />
              <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10">精選商品</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {products.filter(p => p.featured).map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={setQuickView} />)}
                </div>
              </section>
            </>
          )}

          {!loading && !error && view === 'products' && (
            <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{category ? getCategoryName(category) : '所有商品'}</h1>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                <button onClick={() => setCategory(null)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm ${!category ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}>全部</button>
                {categories.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm ${category === c.id ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}>{c.icon} {c.name}</button>)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={setQuickView} />)}
              </div>
            </section>
          )}

          {view === 'cart' && <CartView cart={cart} setCart={setCart} onCheckout={checkout} loading={checkoutLoading} />}
          {view === 'admin' && isAdminLoggedIn && <AdminPanel store={store} onLogout={handleAdminLogout} />}
        </main>

        {view !== 'admin' && <Footer />}
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />}
        {showLoginModal && <LoginModal onLogin={handleAdminLogin} onClose={() => setShowLoginModal(false)} />}
      </div>
    </>
  );
}