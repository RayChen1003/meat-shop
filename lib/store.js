// lib/store.js - 全域狀態管理
import { useState, useEffect } from 'react';

const createStore = () => {
  let products = [
    { id: 1, name: '頂級和牛肋眼', nameEn: 'Premium Wagyu Ribeye', category: 'beef', price: 2800, stock: 50, unit: '200g', description: 'A5等級日本和牛，油花分布均勻，入口即化', image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=600', featured: true },
    { id: 2, name: '澳洲穀飼牛排', nameEn: 'Australian Grain-fed Steak', category: 'beef', price: 680, stock: 120, unit: '250g', description: '180天穀飼，肉質鮮嫩多汁', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600', featured: true },
    { id: 3, name: '西班牙伊比利豬', nameEn: 'Spanish Iberico Pork', category: 'pork', price: 1200, stock: 80, unit: '300g', description: '橡果放養，世界頂級豬肉', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600', featured: true },
    { id: 4, name: '台灣黑毛豬里肌', nameEn: 'Taiwan Black Pork Loin', category: 'pork', price: 380, stock: 15, unit: '300g', description: '本土放牧黑毛豬，肉質緊實香甜', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600', featured: false },
    { id: 5, name: '法式春雞', nameEn: 'French Spring Chicken', category: 'poultry', price: 450, stock: 8, unit: '整隻', description: '法國進口，肉質細緻鮮嫩', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600', featured: false },
    { id: 6, name: '紐西蘭小羊排', nameEn: 'New Zealand Lamb Rack', category: 'lamb', price: 980, stock: 45, unit: '400g', description: '草飼小羊，無羶味，口感嫩滑', image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600', featured: true },
  ];
  let orders = [];
  let inventoryLog = [];
  let listeners = [];
  
  const notify = () => listeners.forEach(fn => fn());

  return {
    subscribe: (fn) => { 
      listeners.push(fn); 
      return () => { listeners = listeners.filter(l => l !== fn); }; 
    },
    getProducts: () => [...products],
    getOrders: () => [...orders],
    getInventoryLog: () => [...inventoryLog],
    
    addProduct: (p) => { 
      const np = { ...p, id: Date.now() }; 
      products = [...products, np]; 
      notify(); 
      return np;
    },
    
    updateProduct: (id, data) => { 
      products = products.map(p => p.id === id ? { ...p, ...data } : p); 
      notify(); 
      return products.find(p => p.id === id); 
    },
    
    deleteProduct: (id) => { 
      products = products.filter(p => p.id !== id); 
      notify(); 
    },
    
    updateInventory: (pid, change, type, note = '') => {
      const log = { 
        id: Date.now(), 
        productId: pid, 
        change, 
        type, 
        note, 
        timestamp: new Date().toISOString() 
      };
      inventoryLog = [...inventoryLog, log];
      products = products.map(p => p.id === pid ? { ...p, stock: p.stock + change } : p);
      notify();
      return log;
    },
    
    createOrder: (o) => {
      const no = { 
        ...o, 
        id: `ORD-${Date.now()}`, 
        status: 'pending', 
        createdAt: new Date().toISOString() 
      };
      orders = [...orders, no];
      
      // 扣減庫存並記錄
      o.items.forEach(it => {
        products = products.map(p => p.id === it.productId ? { ...p, stock: p.stock - it.quantity } : p);
        inventoryLog = [...inventoryLog, { 
          id: Date.now() + Math.random(), 
          productId: it.productId, 
          change: -it.quantity, 
          type: 'out', 
          note: `訂單 ${no.id}`, 
          timestamp: new Date().toISOString() 
        }];
      });
      notify();
      return no;
    },
  };
};

// 單例 store
let store = null;
export const getStore = () => {
  if (!store) store = createStore();
  return store;
};

// React Hook
export const useStore = () => {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const s = getStore();
    return s.subscribe(() => forceUpdate(n => n + 1));
  }, []);
  return getStore();
};

// 工具函數
export const formatPrice = (p) => `NT$ ${p.toLocaleString()}`;
export const getCategoryName = (c) => ({ beef: '牛肉', pork: '豬肉', poultry: '禽肉', lamb: '羊肉' }[c] || c);
