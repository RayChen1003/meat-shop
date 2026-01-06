// lib/store.js - Supabase 資料庫連接版本
import { useState, useEffect, useCallback } from 'react';

// ===== Supabase 設定 =====
const SUPABASE_URL = 'https://dqdaiqznulorhrdckwsf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZGFpcXpudWxvcmhyZGNrd3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTQ3NDgsImV4cCI6MjA4MzIzMDc0OH0.jZxA-itnxqcO3tYsL6jjE6Vd1l9qGwqAfrzAA58El0c';

// Supabase REST API 呼叫
const supabase = {
  async fetch(table, options = {}) {
    const { method = 'GET', body, query = '', headers = {} } = options;
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    
    const res = await fetch(url, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
    
    if (method === 'DELETE' || (method === 'PATCH' && !headers['Prefer'])) {
      return null;
    }
    
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },

  // 取得資料
  async select(table, query = '') {
    return this.fetch(table, { query: `?${query}` });
  },

  // 新增資料
  async insert(table, data) {
    return this.fetch(table, { 
      method: 'POST', 
      body: data,
      headers: { 'Prefer': 'return=representation' }
    });
  },

  // 更新資料
  async update(table, id, data) {
    return this.fetch(table, { 
      method: 'PATCH', 
      body: data, 
      query: `?id=eq.${id}`,
      headers: { 'Prefer': 'return=representation' }
    });
  },

  // 刪除資料
  async delete(table, id) {
    return this.fetch(table, { 
      method: 'DELETE', 
      query: `?id=eq.${id}` 
    });
  },
};

// ===== React Hook: useStore =====
export const useStore = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryLog, setInventoryLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入所有資料
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, ordersData, logData] = await Promise.all([
        supabase.select('products', 'order=id.asc'),
        supabase.select('orders', 'order=created_at.desc'),
        supabase.select('inventory_log', 'order=created_at.desc&limit=50'),
      ]);
      
      // 轉換欄位名稱 (snake_case -> camelCase)
      setProducts(productsData.map(p => ({
        id: p.id,
        name: p.name,
        nameEn: p.name_en,
        category: p.category,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
        description: p.description,
        image: p.image,
        featured: p.featured,
      })));
      
      setOrders(ordersData.map(o => ({
        id: o.id,
        items: o.items,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
      })));
      
      setInventoryLog(logData.map(l => ({
        id: l.id,
        productId: l.product_id,
        change: l.change,
        type: l.type,
        note: l.note,
        timestamp: l.created_at,
      })));
      
    } catch (err) {
      console.error('載入資料失敗:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始載入
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 新增商品
  const addProduct = async (product) => {
    try {
      const data = {
        name: product.name,
        name_en: product.nameEn,
        category: product.category,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        description: product.description,
        image: product.image,
        featured: product.featured,
      };
      
      const result = await supabase.insert('products', data);
      if (result && result[0]) {
        const newProduct = {
          id: result[0].id,
          name: result[0].name,
          nameEn: result[0].name_en,
          category: result[0].category,
          price: result[0].price,
          stock: result[0].stock,
          unit: result[0].unit,
          description: result[0].description,
          image: result[0].image,
          featured: result[0].featured,
        };
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      }
    } catch (err) {
      console.error('新增商品失敗:', err);
      throw err;
    }
  };

  // 更新商品
  const updateProduct = async (id, updates) => {
    try {
      const data = {};
      if (updates.name !== undefined) data.name = updates.name;
      if (updates.nameEn !== undefined) data.name_en = updates.nameEn;
      if (updates.category !== undefined) data.category = updates.category;
      if (updates.price !== undefined) data.price = updates.price;
      if (updates.stock !== undefined) data.stock = updates.stock;
      if (updates.unit !== undefined) data.unit = updates.unit;
      if (updates.description !== undefined) data.description = updates.description;
      if (updates.image !== undefined) data.image = updates.image;
      if (updates.featured !== undefined) data.featured = updates.featured;
      
      await supabase.update('products', id, data);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) {
      console.error('更新商品失敗:', err);
      throw err;
    }
  };

  // 刪除商品
  const deleteProduct = async (id) => {
    try {
      await supabase.delete('products', id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('刪除商品失敗:', err);
      throw err;
    }
  };

  // 更新庫存
  const updateInventory = async (productId, change, type, note = '') => {
    try {
      // 1. 新增庫存異動紀錄
      const logResult = await supabase.insert('inventory_log', {
        product_id: productId,
        change: change,
        type: type,
        note: note,
      });

      // 2. 更新商品庫存
      const product = products.find(p => p.id === productId);
      if (product) {
        const newStock = product.stock + change;
        await supabase.update('products', productId, { stock: newStock });
        
        // 更新本地狀態
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        ));
        
        if (logResult && logResult[0]) {
          setInventoryLog(prev => [{
            id: logResult[0].id,
            productId: logResult[0].product_id,
            change: logResult[0].change,
            type: logResult[0].type,
            note: logResult[0].note,
            timestamp: logResult[0].created_at,
          }, ...prev]);
        }
      }
    } catch (err) {
      console.error('更新庫存失敗:', err);
      throw err;
    }
  };

  // 建立訂單
  const createOrder = async (orderData) => {
    try {
      const orderId = `ORD-${Date.now()}`;
      
      // 1. 新增訂單
      const orderResult = await supabase.insert('orders', {
        id: orderId,
        items: orderData.items,
        total: orderData.total,
        status: 'pending',
      });

      // 2. 扣減庫存並記錄
      for (const item of orderData.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          
          // 更新庫存
          await supabase.update('products', item.productId, { stock: newStock });
          
          // 記錄異動
          await supabase.insert('inventory_log', {
            product_id: item.productId,
            change: -item.quantity,
            type: 'out',
            note: `訂單 ${orderId}`,
          });
        }
      }

      // 3. 更新本地狀態
      if (orderResult && orderResult[0]) {
        setOrders(prev => [{
          id: orderResult[0].id,
          items: orderResult[0].items,
          total: orderResult[0].total,
          status: orderResult[0].status,
          createdAt: orderResult[0].created_at,
        }, ...prev]);
      }

      // 更新商品庫存
      setProducts(prev => prev.map(p => {
        const item = orderData.items.find(i => i.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock - item.quantity };
        }
        return p;
      }));

      // 重新載入庫存紀錄
      loadData();
      
      return { id: orderId };
    } catch (err) {
      console.error('建立訂單失敗:', err);
      throw err;
    }
  };

  return {
    // 資料
    products,
    orders,
    inventoryLog,
    loading,
    error,
    
    // 方法
    getProducts: () => products,
    getOrders: () => orders,
    getInventoryLog: () => inventoryLog,
    addProduct,
    updateProduct,
    deleteProduct,
    updateInventory,
    createOrder,
    reload: loadData,
  };
};

// 工具函數
export const formatPrice = (p) => `NT$ ${p.toLocaleString()}`;
export const getCategoryName = (c) => ({ beef: '牛肉', pork: '豬肉', poultry: '禽肉', lamb: '羊肉' }[c] || c);
