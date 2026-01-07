// pages/order-success.js - 訂單成功頁面
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/Layout';

export default function OrderSuccess() {
  return (
    <Layout>
      <Head>
        <title>訂單成功 | 公司名稱</title>
      </Head>

      <div className="text-center py-16 sm:py-24 px-4">
        <div className="text-6xl sm:text-8xl mb-6">🎉</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">訂單已成功送出！</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          感謝您的訂購！我們會盡快處理您的訂單，並以 Email 通知您出貨進度。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/myorders" 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            查看訂單
          </Link>
          <Link 
            href="/products" 
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
          >
            繼續購物
          </Link>
        </div>
      </div>
    </Layout>
  );
}
