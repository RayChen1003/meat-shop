// pages/checkout.js - 結帳頁面
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth, useCart, useStore, formatPrice } from '../lib/store';

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { createOrder } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  if (cart.length === 0) {
    return (
      <Layout>
        <Head>
          <title>結帳 | 肉品公司</title>
        </Head>
        <div className="text-center py-16 px-4">
          <div className="text-5xl opacity-50 mb-4">🛒</div>
          <h2 className="text-xl font-bold mb-2">購物車是空的</h2>
          <button onClick={() => router.push('/products')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">
            去逛逛
          </button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createOrder(
        {
          items: cart.map(i => ({ 
            productId: i.product.id, 
            name: i.product.name, 
            price: i.product.price, 
            quantity: i.quantity 
          })),
          total: cartTotal
        },
        form,
        user?.id || null
      );
      clearCart();
      router.push('/order-success');
    } catch (err) {
      alert('訂單送出失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>結帳 | 肉品公司</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">結帳</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 訂單摘要 */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm h-fit order-2 md:order-1">
            <h2 className="font-bold text-lg mb-4">訂單摘要</h2>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-bold">總計</span>
              <span className="text-xl font-bold text-primary">{formatPrice(cartTotal)}</span>
            </div>
          </div>

          {/* 收件資訊 */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm order-1 md:order-2">
            <h2 className="font-bold text-lg mb-4">收件資訊</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">姓名 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">電話 *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">收件地址 *</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
              >
                {loading ? '處理中...' : `確認付款 ${formatPrice(cartTotal)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
