// pages/cart.js - 購物車頁面
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { useCart, formatPrice } from '../lib/store';

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <Layout>
        <Head>
          <title>購物車 | 公司名稱</title>
        </Head>
        <div className="text-center py-16 sm:py-20 px-4">
          <div className="text-5xl sm:text-6xl opacity-50 mb-3 sm:mb-4">🛒</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">購物車是空的</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-6">快去選購美味的肉品吧！</p>
          <Link href="/products" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
            瀏覽商品
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>購物車 | 公司名稱</title>
      </Head>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">購物車</h1>
        
        <div className="space-y-2 sm:space-y-3">
          {cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <img 
                src={item.product.image} 
                alt={item.product.name} 
                className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-lg flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">{item.product.name}</h3>
                <span className="text-primary font-semibold text-sm sm:text-base">{formatPrice(item.product.price)}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button 
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)} 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  −
                </button>
                <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stock))} 
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  +
                </button>
              </div>
              <div className="font-bold text-sm sm:text-base min-w-[70px] sm:min-w-[100px] text-right hidden sm:block">
                {formatPrice(item.product.price * item.quantity)}
              </div>
              <button 
                onClick={() => removeFromCart(item.product.id)} 
                className="text-gray-400 hover:text-red-500 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mt-3 sm:mt-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="text-base sm:text-lg">總計</span>
            <span className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(cartTotal)}</span>
          </div>
          <Link 
            href="/checkout" 
            className="block w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base text-center"
          >
            前往結帳 →
          </Link>
        </div>
      </div>
    </Layout>
  );
}
