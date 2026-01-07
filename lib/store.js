// lib/store.js - Supabase 資料庫連接 + 會員系統
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ===== Supabase 設定 =====
const SUPABASE_URL = 'https://dqdaiqznulorhrdckwsf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZGFpcXpudWxvcmhyZGNrd3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTQ3NDgsImV4cCI6MjA4MzIzMDc0OH0.jZxA-itnxqcO3tYsL6jjE6Vd1l9qGwqAfrzAA58El0c';

// Supabase REST API
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

  async select(table, query = '') {
    return this.fetch(table, { query: `?${query}` });
  },

  async insert(table, data) {
    return this.fetch(table, { 
      method: 'POST', 
      body: data,
      headers: { 'Prefer': 'return=representation' }
    });
  },

  async update(table, id, data, idField = 'id') {
    return this.fetch(table, { 
      method: 'PATCH', 
      body: data, 
      query: `?${idField}=eq.${id}`,
      headers: { 'Prefer': 'return=representation' }
    });
  },

  async delete(table, id) {
    return this.fetch(table, { 
      method: 'DELETE', 
      query: `?id=eq.${id}` 
    });
  },
};

// ===== Auth Context =====
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email, password, name) => {
    const existing = await supabase.select('users', `email=eq.${encodeURIComponent(email)}`);
    if (existing && existing.length > 0) {
      throw new Error('此 Email 已被註冊');
    }

    const result = await supabase.insert('users', {
      email,
      password,
      name,
      role: 'customer'
    });

    if (result && result[0]) {
      const newUser = {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        role: result[0].role
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const login = async (email, password) => {
    const result = await supabase.select('users', `email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`);
    
    if (!result || result.length === 0) {
      throw new Error('帳號或密碼錯誤');
    }

    const loggedInUser = {
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      role: result[0].role
    };
    
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      isCustomer: user?.role === 'customer',
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ===== Store Context =====
const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryLog, setInventoryLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, ordersData, logData] = await Promise.all([
        supabase.select('products', 'order=id.asc'),
        supabase.select('orders', 'order=created_at.desc'),
        supabase.select('inventory_log', 'order=created_at.desc&limit=50'),
      ]);
      
      setProducts((productsData || []).map(p => ({
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
      
      setOrders((ordersData || []).map(o => ({
        id: o.id,
        items: o.items,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
        userId: o.user_id,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        customerAddress: o.customer_address,
      })));
      
      setInventoryLog((logData || []).map(l => ({
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addProduct = async (product) => {
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
  };

  const updateProduct = async (id, updates) => {
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
  };

  const deleteProduct = async (id) => {
    await supabase.delete('products', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // updateInventory: type 為 'adjust' 時，change 代表「目標數量」而非增減量
  const updateInventory = async (productId, change, type, note = '') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let actualChange;
    let newStock;

    if (type === 'adjust') {
      // 盤點：change 是目標數量，計算實際差異
      newStock = change; // change 在盤點時代表目標庫存
      actualChange = newStock - product.stock;
    } else {
      // 進貨/出貨：change 是增減量
      actualChange = change;
      newStock = product.stock + change;
    }

    const logResult = await supabase.insert('inventory_log', {
      product_id: productId,
      change: actualChange,
      type: type,
      note: note,
    });

    await supabase.update('products', productId, { stock: newStock });
    
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
  };

  const createOrder = async (orderData, customerInfo = {}, userId = null) => {
    const orderId = `ORD-${Date.now()}`;
    
    const orderResult = await supabase.insert('orders', {
      id: orderId,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      user_id: userId,
      customer_name: customerInfo.name || null,
      customer_email: customerInfo.email || null,
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
    });

    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newStock = product.stock - item.quantity;
        await supabase.update('products', item.productId, { stock: newStock });
        await supabase.insert('inventory_log', {
          product_id: item.productId,
          change: -item.quantity,
          type: 'out',
          note: `訂單 ${orderId}`,
        });
      }
    }

    if (orderResult && orderResult[0]) {
      setOrders(prev => [{
        id: orderResult[0].id,
        items: orderResult[0].items,
        total: orderResult[0].total,
        status: orderResult[0].status,
        createdAt: orderResult[0].created_at,
        userId: orderResult[0].user_id,
        customerName: orderResult[0].customer_name,
        customerEmail: orderResult[0].customer_email,
        customerPhone: orderResult[0].customer_phone,
        customerAddress: orderResult[0].customer_address,
      }, ...prev]);
    }

    setProducts(prev => prev.map(p => {
      const item = orderData.items.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stock: p.stock - item.quantity };
      }
      return p;
    }));

    return { id: orderId };
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // 已完成或已取消的訂單不能再改
    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new Error('此訂單狀態已無法變更');
    }

    // 如果是取消訂單，退回庫存
    if (status === 'cancelled') {
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = product.stock + item.quantity;
          await supabase.update('products', item.productId, { stock: newStock });
          await supabase.insert('inventory_log', {
            product_id: item.productId,
            change: item.quantity,
            type: 'in',
            note: `訂單取消 ${orderId}（因取消 +${item.quantity}）`,
          });
          
          // 更新本地商品庫存
          setProducts(prev => prev.map(p => 
            p.id === item.productId ? { ...p, stock: newStock } : p
          ));
        }
      }
      // 重新載入庫存紀錄
      const logData = await supabase.select('inventory_log', 'order=created_at.desc&limit=50');
      setInventoryLog((logData || []).map(l => ({
        id: l.id,
        productId: l.product_id,
        change: l.change,
        type: l.type,
        note: l.note,
        timestamp: l.created_at,
      })));
    }

    await supabase.fetch('orders', {
      method: 'PATCH',
      body: { status },
      query: `?id=eq.${orderId}`,
      headers: { 'Prefer': 'return=representation' }
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // 取得所有顧客
  const getCustomers = async () => {
    const result = await supabase.select('users', 'role=eq.customer&order=created_at.desc');
    return result || [];
  };

  // 更新顧客資料
  const updateCustomer = async (id, data) => {
    await supabase.update('users', id, data);
  };

  // 刪除顧客
  const deleteCustomer = async (id) => {
    await supabase.delete('users', id);
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      inventoryLog,
      loading,
      error,
      addProduct,
      updateProduct,
      deleteProduct,
      updateInventory,
      createOrder,
      updateOrderStatus,
      getCustomers,
      updateCustomer,
      deleteCustomer,
      reload: loadData,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

// ===== Cart Context =====
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loaded]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id 
          ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } 
          : i
        );
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock) }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => 
        i.product.id === productId ? { ...i, quantity } : i
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// 工具函數
export const formatPrice = (p) => `NT$ ${p.toLocaleString()}`;
export const getCategoryName = (c) => ({ beef: '牛肉', pork: '豬肉', poultry: '禽肉', lamb: '羊肉' }[c] || c);
export const getStatusName = (s) => ({ pending: '待處理', confirmed: '已確認', shipping: '配送中', completed: '已完成', cancelled: '已取消' }[s] || s);
export const getStatusColor = (s) => ({ pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipping: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700');
