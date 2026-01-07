// pages/products.js - 商品列表頁
import Head from 'next/head';
import { useState } from 'react';
import { Layout, LoadingSpinner } from '../components/Layout';
import { ProductCard, QuickViewModal } from '../components/Product';
import { useStore, getCategoryName } from '../lib/store';

const categories = [
  { id: 'beef', name: '牛肉', icon: '🥩' },
  { id: 'pork', name: '豬肉', icon: '🐷' },
  { id: 'poultry', name: '禽肉', icon: '🐔' },
  { id: 'lamb', name: '羊肉', icon: '🐑' },
];

export default function Products() {
  const { products, loading } = useStore();
  const [category, setCategory] = useState(null);
  const [quickView, setQuickView] = useState(null);

  const filtered = category ? products.filter(p => p.category === category) : products;

  return (
    <Layout>
      <Head>
        <title>商品列表 | 肉品公司</title>
        <meta name="description" content="瀏覽我們精選的頂級肉品" />
      </Head>

      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          {category ? getCategoryName(category) : '所有商品'}
        </h1>

        {/* 分類篩選 */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          <button 
            onClick={() => setCategory(null)} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm ${!category ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}
          >
            全部
          </button>
          {categories.map(c => (
            <button 
              key={c.id} 
              onClick={() => setCategory(c.id)} 
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm ${category === c.id ? 'bg-primary text-white' : 'bg-white border hover:border-primary'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* 商品列表 */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onView={setQuickView} 
              />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            沒有找到商品
          </div>
        )}
      </section>

      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </Layout>
  );
}
