// pages/admin/index.js - 後台管理頁面
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth, useStore, formatPrice, getCategoryName, getStatusName, getStatusColor } from '../../lib/store';
import { Header, LoadingSpinner, ErrorMessage } from '../../components/Layout';

// ===== Inventory Modal =====
const InventoryModal = ({ product, onClose, onSave }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState('in');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const inputNum = Number(input) || 0;
  
  // 計算新庫存和實際變動
  let newStock, actualChange, isValid;
  if (type === 'adjust') {
    // 盤點：input 是目標庫存數量
    newStock = inputNum;
    actualChange = inputNum - product.stock;
    isValid = input !== '' && inputNum >= 0;
  } else if (type === 'out') {
    // 出貨：減少庫存
    actualChange = -Math.abs(inputNum);
    newStock = product.stock + actualChange;
    isValid = input !== '' && inputNum > 0 && newStock >= 0;
  } else {
    // 進貨：增加庫存
    actualChange = Math.abs(inputNum);
    newStock = product.stock + actualChange;
    isValid = input !== '' && inputNum > 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid) {
      setSaving(true);
      try {
        // 盤點時傳目標數量，進出貨時傳變動量
        const valueToSave = type === 'adjust' ? inputNum : actualChange;
        await onSave(product.id, valueToSave, type, note);
        onClose();
      } catch (err) {
        alert('儲存失敗：' + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  // 根據類型顯示不同的標籤和提示
  const getInputLabel = () => {
    if (type === 'adjust') return '盤點後數量 *';
    if (type === 'out') return '出貨數量 *';
    return '進貨數量 *';
  };

  const getInputPlaceholder = () => {
    if (type === 'adjust') return `輸入實際庫存數量（目前 ${product.stock}）`;
    return '輸入數量';
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-1">📦 調整庫存</h2>
        <p className="font-semibold">{product.name}</p>
        <p className="text-gray-500 text-sm mb-4">目前庫存：<strong className="text-primary">{product.stock} {product.unit}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">異動類型</label>
            <div className="grid grid-cols-3 gap-2">
              {[['in', '📥 進貨'], ['out', '📤 出貨'], ['adjust', '📋 盤點']].map(([k, v]) => (
                <button key={k} type="button" onClick={() => { setType(k); setInput(''); }} className={`py-2 rounded-lg text-xs ${type === k ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{v}</button>
              ))}
            </div>
            {type === 'adjust' && (
              <p className="text-xs text-gray-500 mt-2">💡 盤點：直接輸入清點後的實際數量</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">{getInputLabel()}</label>
            <input 
              type="number" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              min={type === 'adjust' ? '0' : '1'} 
              placeholder={getInputPlaceholder()} 
              required 
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-sm">備註</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder={type === 'adjust' ? '例：月底盤點' : '例：供應商補貨'} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" />
          </div>
          {input !== '' && (
            <div className={`p-3 rounded-xl mb-4 text-center ${newStock < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="text-gray-600 text-xs">調整後庫存</div>
              <div className={`text-xl font-bold ${newStock < 0 ? 'text-red-600' : 'text-green-600'}`}>{newStock} {product.unit}</div>
              {actualChange !== 0 && (
                <div className={`text-sm ${actualChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  （{actualChange > 0 ? '+' : ''}{actualChange}）
                </div>
              )}
              {newStock < 0 && <div className="text-red-600 text-xs mt-1">⚠️ 庫存不能為負數</div>}
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">取消</button>
            <button type="submit" disabled={!isValid || saving} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${isValid && !saving ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}>
              {saving ? '儲存中...' : '✓ 確認'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Product Modal =====
const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(product || { name: '', nameEn: '', category: 'beef', price: '', stock: '', unit: '', description: '', image: '', featured: false });
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(product?.id, { ...form, price: Number(form.price), stock: Number(form.stock) });
      onClose();
    } catch (err) {
      alert('儲存失敗：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-lg w-full my-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{product ? '編輯商品' : '新增商品'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 font-semibold text-xs">商品名稱*</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
            <div><label className="block mb-1 font-semibold text-xs">英文名稱</label><input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 font-semibold text-xs">分類*</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm"><option value="beef">牛肉</option><option value="pork">豬肉</option><option value="poultry">禽肉</option><option value="lamb">羊肉</option></select></div>
            <div><label className="block mb-1 font-semibold text-xs">單位*</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="如：200g" required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 font-semibold text-xs">價格 (NT$)*</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
            <div><label className="block mb-1 font-semibold text-xs">庫存*</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
          </div>
          <div><label className="block mb-1 font-semibold text-xs">圖片網址</label><input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
          <div><label className="block mb-1 font-semibold text-xs">描述</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary outline-none text-sm" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4" /><span className="text-sm">設為精選商品</span></label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">取消</button>
            <button type="submit" disabled={saving} className={`flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm ${saving ? 'opacity-50' : ''}`}>{saving ? '儲存中...' : '儲存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Customer Modal =====
const CustomerModal = ({ customer, onClose, onSave }) => {
  const [form, setForm] = useState({ name: customer?.name || '', email: customer?.email || '' });
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(customer.id, form); onClose(); } 
    catch (err) { alert('儲存失敗：' + err.message); } 
    finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">編輯顧客資料</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block mb-1 font-semibold text-sm">姓名</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" /></div>
          <div><label className="block mb-1 font-semibold text-sm">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none" /></div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm">取消</button>
            <button type="submit" disabled={saving} className={`flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm ${saving ? 'opacity-50' : ''}`}>{saving ? '儲存中...' : '儲存'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== Admin Page =====
export default function Admin() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products, orders, inventoryLog, loading, error, reload, addProduct, updateProduct, deleteProduct, updateInventory, updateOrderStatus, getCustomers, updateCustomer, deleteCustomer } = useStore();
  
  const [tab, setTab] = useState('inventory');
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invModal, setInvModal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.push('/login?redirect=/admin');
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (tab === 'customers') loadCustomers();
  }, [tab]);

  const loadCustomers = async () => {
    setCustomersLoading(true);
    try { const data = await getCustomers(); setCustomers(data); } 
    catch (err) { console.error('載入顧客失敗:', err); } 
    finally { setCustomersLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try { await updateOrderStatus(orderId, newStatus); } 
    catch (err) { alert(err.message); }
  };

  const handleDeleteCustomer = async (id) => {
    if (confirm('確定刪除此顧客？')) {
      try { await deleteCustomer(id); setCustomers(prev => prev.filter(c => c.id !== id)); } 
      catch (err) { alert('刪除失敗：' + err.message); }
    }
  };

  const handleSaveCustomer = async (id, data) => {
    await updateCustomer(id, data);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  if (authLoading || loading) return <div className="min-h-screen bg-[#faf8f5]"><Header /><LoadingSpinner /></div>;
  if (!user || !isAdmin) return null;

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 20).length;
  const handleSaveProduct = async (id, data) => { if (id) await updateProduct(id, data); else await addProduct(data); };
  const getCustomerStats = (customerId) => {
    const customerOrders = orders.filter(o => o.userId === customerId);
    return { orderCount: customerOrders.length, totalSpent: customerOrders.reduce((sum, o) => sum + o.total, 0) };
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Head><title>後台管理 | 公司名稱</title></Head>
      <Header />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)]">
        {/* Mobile Tab */}
        <div className="md:hidden flex bg-gray-900">
          {[['inventory', '📊'], ['products', '📦'], ['orders', '📋'], ['customers', '👥']].map(([k, icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-3 text-center ${tab === k ? 'bg-primary text-white' : 'text-gray-400'}`}><span className="text-lg">{icon}</span></button>
          ))}
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-52 bg-gray-900 p-4">
          <div className="mb-4 pb-3 border-b border-gray-700"><h2 className="text-white font-bold">後台管理</h2></div>
          <nav className="space-y-1">
            {[['inventory', '📊 進銷存'], ['products', '📦 商品'], ['orders', '📋 訂單'], ['customers', '👥 顧客']].map(([k, v]) => (
              <button key={k} onClick={() => setTab(k)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${tab === k ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{v}</button>
            ))}
          </nav>
          <button onClick={reload} className="w-full mt-4 px-3 py-2 text-gray-400 hover:text-white text-sm text-left">🔄 重新整理</button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {error && <ErrorMessage message={error} onRetry={reload} />}
          
          {/* 進銷存 */}
          {tab === 'inventory' && (
            <div>
              <h2 className="text-xl font-bold mb-4">📊 進銷存管理</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">📦</div><div className="text-2xl font-bold">{products.length}</div><div className="text-gray-500 text-sm">商品種類</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">💰</div><div className="text-lg font-bold">{formatPrice(totalValue)}</div><div className="text-gray-500 text-sm">庫存價值</div></div>
                <div className={`bg-white p-4 rounded-xl shadow-sm ${lowStock > 0 ? 'border-l-4 border-orange-500' : ''}`}><div className="text-2xl mb-1">⚠️</div><div className={`text-2xl font-bold ${lowStock > 0 ? 'text-orange-500' : ''}`}>{lowStock}</div><div className="text-gray-500 text-sm">低庫存</div></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs">商品</th><th className="px-3 py-2 text-left text-xs">庫存</th><th className="px-3 py-2 text-left text-xs hidden sm:table-cell">價值</th><th className="px-3 py-2 text-left text-xs">狀態</th><th className="px-3 py-2 text-left text-xs">操作</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={`border-t ${p.stock < 20 ? 'bg-yellow-50' : ''}`}>
                        <td className="px-3 py-2 font-semibold text-xs">{p.name}</td>
                        <td className="px-3 py-2 text-xs"><span className={`font-bold ${p.stock < 10 ? 'text-red-600' : p.stock < 20 ? 'text-orange-500' : ''}`}>{p.stock}</span></td>
                        <td className="px-3 py-2 text-xs hidden sm:table-cell">{formatPrice(p.price * p.stock)}</td>
                        <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${p.stock < 10 ? 'bg-red-100 text-red-600' : p.stock < 20 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{p.stock < 10 ? '緊急' : p.stock < 20 ? '偏低' : '正常'}</span></td>
                        <td className="px-3 py-2"><button onClick={() => setInvModal(p)} className="px-2 py-1 bg-primary text-white text-[10px] rounded-lg hover:bg-primary-dark">調整</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {inventoryLog.length > 0 && (<>
                <h3 className="text-base font-bold mb-2">異動紀錄</h3>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr><th className="px-2 py-2 text-left">時間</th><th className="px-2 py-2 text-left">商品</th><th className="px-2 py-2 text-left">類型</th><th className="px-2 py-2 text-left">數量</th><th className="px-2 py-2 text-left hidden sm:table-cell">備註</th></tr></thead>
                    <tbody>
                      {inventoryLog.slice(0, 20).map(log => {
                        const prod = products.find(x => x.id === log.productId);
                        return (<tr key={log.id} className="border-t">
                          <td className="px-2 py-2 text-gray-500">{new Date(log.timestamp).toLocaleDateString('zh-TW')}</td>
                          <td className="px-2 py-2">{prod?.name || '已刪除'}</td>
                          <td className="px-2 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${log.type === 'in' ? 'bg-green-100 text-green-600' : log.type === 'out' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{log.type === 'in' ? '進' : log.type === 'out' ? '出' : '盤'}</span></td>
                          <td className={`px-2 py-2 font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{log.change > 0 ? '+' : ''}{log.change}</td>
                          <td className="px-2 py-2 text-gray-500 hidden sm:table-cell truncate max-w-[150px]">{log.note}</td>
                        </tr>);
                      })}
                    </tbody>
                  </table>
                </div>
              </>)}
            </div>
          )}

          {/* 商品管理 */}
          {tab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📦 商品管理</h2>
                <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm">+ 新增</button>
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs">商品</th><th className="px-3 py-2 text-left text-xs hidden sm:table-cell">分類</th><th className="px-3 py-2 text-left text-xs">價格</th><th className="px-3 py-2 text-left text-xs">庫存</th><th className="px-3 py-2 text-left text-xs">操作</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="px-3 py-2 font-semibold text-xs">{p.name}</td>
                        <td className="px-3 py-2 text-xs hidden sm:table-cell">{getCategoryName(p.category)}</td>
                        <td className="px-3 py-2 text-xs">{formatPrice(p.price)}</td>
                        <td className="px-3 py-2 text-xs">{p.stock}</td>
                        <td className="px-3 py-2 space-x-1">
                          <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="px-1.5 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs">✏️</button>
                          <button onClick={() => { if (confirm('確定刪除？')) deleteProduct(p.id); }} className="px-1.5 py-1 bg-red-50 rounded hover:bg-red-100 text-xs">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 訂單管理 */}
          {tab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold mb-4">📋 訂單管理</h2>
              {orders.length === 0 ? <div className="text-center py-12 text-gray-500">尚無訂單</div> : (
                <div className="space-y-4">
                  {orders.map(o => {
                    const isLocked = o.status === 'completed' || o.status === 'cancelled';
                    return (
                      <div key={o.id} className={`bg-white rounded-xl p-4 shadow-sm ${isLocked ? 'opacity-75' : ''}`}>
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <div><div className="font-semibold text-sm">{o.id}</div><div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('zh-TW')}</div></div>
                          {isLocked ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>{getStatusName(o.status)} 🔒</span>
                          ) : (
                            <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(o.status)}`}>
                              <option value="pending">待處理</option><option value="confirmed">已確認</option><option value="shipping">配送中</option><option value="completed">已完成</option><option value="cancelled">已取消</option>
                            </select>
                          )}
                        </div>
                        {o.customerName && <div className="text-xs text-gray-600 mb-2">👤 {o.customerName} | 📞 {o.customerPhone} | 📍 {o.customerAddress}</div>}
                        <div className="border-t pt-3">
                          <div className="space-y-1 mb-2">{o.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>))}</div>
                          <div className="flex justify-between font-bold text-sm"><span>總計</span><span className="text-primary">{formatPrice(o.total)}</span></div>
                        </div>
                        {isLocked && <div className="mt-2 text-xs text-gray-400 text-center">此訂單已{o.status === 'completed' ? '完成' : '取消'}，無法再變更狀態</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 顧客管理 */}
          {tab === 'customers' && (
            <div>
              <h2 className="text-xl font-bold mb-4">👥 顧客管理</h2>
              {customersLoading ? <LoadingSpinner /> : customers.length === 0 ? <div className="text-center py-12 text-gray-500">尚無顧客</div> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr><th className="px-3 py-3 text-left text-xs">顧客</th><th className="px-3 py-3 text-left text-xs hidden sm:table-cell">Email</th><th className="px-3 py-3 text-left text-xs">訂單數</th><th className="px-3 py-3 text-left text-xs">消費總額</th><th className="px-3 py-3 text-left text-xs hidden sm:table-cell">註冊日期</th><th className="px-3 py-3 text-left text-xs">操作</th></tr></thead>
                    <tbody>
                      {customers.map(c => {
                        const stats = getCustomerStats(c.id);
                        return (<tr key={c.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-3"><div className="font-semibold text-sm">{c.name}</div><div className="text-xs text-gray-500 sm:hidden">{c.email}</div></td>
                          <td className="px-3 py-3 text-xs hidden sm:table-cell">{c.email}</td>
                          <td className="px-3 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{stats.orderCount} 筆</span></td>
                          <td className="px-3 py-3 font-semibold text-primary text-xs">{formatPrice(stats.totalSpent)}</td>
                          <td className="px-3 py-3 text-xs text-gray-500 hidden sm:table-cell">{new Date(c.created_at).toLocaleDateString('zh-TW')}</td>
                          <td className="px-3 py-3 space-x-1">
                            <button onClick={() => setEditCustomer(c)} className="px-1.5 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs">✏️</button>
                            <button onClick={() => handleDeleteCustomer(c.id)} className="px-1.5 py-1 bg-red-50 rounded hover:bg-red-100 text-xs">🗑️</button>
                          </td>
                        </tr>);
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">👥</div><div className="text-2xl font-bold">{customers.length}</div><div className="text-gray-500 text-sm">總顧客數</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><div className="text-2xl mb-1">💰</div><div className="text-lg font-bold text-primary">{formatPrice(customers.reduce((sum, c) => sum + getCustomerStats(c.id).totalSpent, 0))}</div><div className="text-gray-500 text-sm">總營收</div></div>
                <div className="bg-white p-4 rounded-xl shadow-sm hidden sm:block"><div className="text-2xl mb-1">📊</div><div className="text-lg font-bold">{customers.length > 0 ? formatPrice(Math.round(customers.reduce((sum, c) => sum + getCustomerStats(c.id).totalSpent, 0) / customers.length)) : 'NT$ 0'}</div><div className="text-gray-500 text-sm">平均客單價</div></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && <ProductModal product={editProduct} onClose={() => { setShowModal(false); setEditProduct(null); }} onSave={handleSaveProduct} />}
      {invModal && <InventoryModal product={invModal} onClose={() => setInvModal(null)} onSave={updateInventory} />}
      {editCustomer && <CustomerModal customer={editCustomer} onClose={() => setEditCustomer(null)} onSave={handleSaveCustomer} />}
    </div>
  );
}
