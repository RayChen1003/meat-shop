// components/Layout.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth, useCart } from '../lib/store';

// ===== Header =====
export const Header = () => {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { href: '/', label: '首頁' },
    { href: '/products', label: '商品' },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">肉</div>
          <div>
            <div className="text-white text-base sm:text-xl font-bold tracking-wide">御選精肉</div>
            <div className="text-accent text-[10px] sm:text-xs tracking-widest hidden sm:block">PREMIUM MEAT</div>
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`px-4 lg:px-5 py-2 rounded-lg transition ${router.pathname === item.href ? 'text-accent border-b-2 border-accent' : 'text-white hover:text-accent'}`}>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={`px-4 lg:px-5 py-2 rounded-lg transition ${router.pathname.startsWith('/admin') ? 'text-accent border-b-2 border-accent' : 'text-white hover:text-accent'}`}>
              後台管理
            </Link>
          )}
          {user && !isAdmin && (
            <Link href="/myorders" className={`px-4 lg:px-5 py-2 rounded-lg transition ${router.pathname === '/myorders' ? 'text-accent border-b-2 border-accent' : 'text-white hover:text-accent'}`}>
              我的訂單
            </Link>
          )}
        </nav>
        
        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-white text-sm">👤 {user.name}</span>
              <button onClick={handleLogout} className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">登出</button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block px-4 py-2 bg-accent text-gray-900 rounded-lg font-medium hover:bg-accent/90">
              登入
            </Link>
          )}
          
          {/* Cart */}
          <Link href="/cart" className="relative w-10 h-10 sm:w-12 sm:h-12 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition shadow-lg">
            <span className="text-white text-base sm:text-lg">🛒</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 bg-accent text-gray-900 text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center px-1">{cartCount}</span>}
          </Link>
          
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
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`block w-full text-left px-6 py-4 border-b border-gray-700 transition ${router.pathname === item.href ? 'text-accent bg-gray-700' : 'text-white hover:bg-gray-700'}`}>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className={`block w-full text-left px-6 py-4 border-b border-gray-700 transition ${router.pathname.startsWith('/admin') ? 'text-accent bg-gray-700' : 'text-white hover:bg-gray-700'}`}>
              ⚙️ 後台管理
            </Link>
          )}
          {user && !isAdmin && (
            <Link href="/myorders" onClick={() => setMenuOpen(false)} className={`block w-full text-left px-6 py-4 border-b border-gray-700 transition ${router.pathname === '/myorders' ? 'text-accent bg-gray-700' : 'text-white hover:bg-gray-700'}`}>
              📋 我的訂單
            </Link>
          )}
          {user ? (
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="text-white mb-2">👤 {user.name}</div>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg">登出</button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full text-left px-6 py-4 border-b border-gray-700 text-accent hover:bg-gray-700">
              🔐 登入 / 註冊
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

// ===== Footer =====
export const Footer = () => (
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

// ===== Layout =====
export const Layout = ({ children, showFooter = true }) => (
  <div className="min-h-screen bg-[#faf8f5] flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    {showFooter && <Footer />}
  </div>
);

// ===== Loading =====
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">載入中...</p>
    </div>
  </div>
);

// ===== Error =====
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && <button onClick={onRetry} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">重試</button>}
    </div>
  </div>
);

export default Layout;
