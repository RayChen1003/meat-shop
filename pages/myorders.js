// pages/myorders.js - 我的訂單頁面
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Layout, LoadingSpinner } from '../components/Layout';
import { useAuth, useStore, formatPrice, getStatusName, getStatusColor } from '../lib/store';

export default function MyOrders() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: storeLoading } = useStore();

  // 未登入導向登入頁
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/myorders');
    }
  }, [user, authLoading, router]);

  if (authLoading || storeLoading) {
    return (
      <Layout>
        <Head>
          <title>我的訂單 | 御選精肉</title>
        </Head>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const myOrders = orders.filter(o => o.userId === user.id);

  return (
    <Layout>
      <Head>
        <title>我的訂單 | 御選精肉</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">我的訂單</h1>

        {myOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-5xl opacity-50 mb-4">📋</div>
            <h2 className="text-xl font-bold mb-2">還沒有訂單</h2>
            <p className="text-gray-500">快去選購美味的肉品吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                  <div>
                    <div className="font-semibold">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-TW')}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusName(order.status)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>總計</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
