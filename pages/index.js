// pages/index.js - 首頁
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Layout, LoadingSpinner } from '../components/Layout';
import { ProductCard, QuickViewModal } from '../components/Product';
import { useStore } from '../lib/store';

const Hero = () => (
  <section 
    className="relative h-[50vh] sm:h-[60vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center text-center" 
    style={{ background: 'linear-gradient(135deg,rgba(26,26,26,0.9),rgba(45,45,45,0.7)),url(https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1920) center/cover' }}
  >
    <div className="px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 leading-tight">
        介紹詞等待輸入<br /><span className="text-accent">公司名稱</span>
      </h1>
      <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
        內容等待輸入
      </p>
      <Link 
        href="/products" 
        className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:shadow-xl transition transform hover:-translate-y-1 text-sm sm:text-base"
      >
        探索商品 →
      </Link>
    </div>
  </section>
);

export default function Home() {
  const { products, loading } = useStore();
  const [quickView, setQuickView] = useState(null);

  const featuredProducts = products.filter(p => p.featured);

  return (
    <Layout>
      <Head>
        <title>公司名稱 | Premium Meat Selection</title>
        <meta name="description" content="標語待輸入" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Hero />

      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10">精選商品</h2>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onView={setQuickView} 
              />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link 
            href="/products" 
            className="inline-block px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition"
          >
            查看所有商品 →
          </Link>
        </div>
      </section>

      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </Layout>
  );
}
