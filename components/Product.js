// components/Product.js
import { useState } from 'react';
import { formatPrice, getCategoryName, useCart } from '../lib/store';

// ===== Product Card =====
export const ProductCard = ({ product, onView }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    if (product.stock > 0 && qty > 0) {
      addToCart(product, Math.min(qty, product.stock));
      setQty(1); // 重置數量
    }
  };

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQty(Math.max(0, Math.min(value, product.stock)));
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 sm:hover:-translate-y-2">
      <div className="relative aspect-[4/3] bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover" 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} 
        />
        {product.featured && (
          <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary text-white text-[10px] sm:text-xs font-semibold rounded-full">
            精選
          </span>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">
            庫存有限
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-500 text-white text-[10px] sm:text-xs font-semibold rounded-full">
            已售完
          </span>
        )}
      </div>
      <div className="p-3 sm:p-5">
        <div className="text-[10px] sm:text-xs text-primary font-semibold uppercase tracking-wider mb-0.5 sm:mb-1">
          {getCategoryName(product.category)}
        </div>
        <h3 className="text-sm sm:text-lg font-bold mb-0.5 sm:mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 hidden sm:block">{product.nameEn}</p>
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-base sm:text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          <span className="text-[10px] sm:text-sm text-gray-400">庫存: {product.stock}</span>
        </div>
        
        {/* 數量輸入區 */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={product.stock === 0}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-lg text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50"
          >
            −
          </button>
          <input
            type="number"
            value={qty}
            onChange={handleQtyChange}
            min="1"
            max={product.stock}
            disabled={product.stock === 0}
            className="w-12 sm:w-14 h-7 sm:h-8 text-center border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-primary outline-none disabled:opacity-50"
          />
          <button 
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            disabled={product.stock === 0}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-lg text-sm sm:text-base hover:bg-gray-200 disabled:opacity-50"
          >
            +
          </button>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2">
          <button 
            onClick={() => onView && onView(product)} 
            className="flex-1 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs sm:text-sm"
          >
            查看
          </button>
          <button 
            onClick={handleAdd} 
            disabled={product.stock === 0 || qty === 0} 
            className={`flex-1 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm ${product.stock === 0 || qty === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}
          >
            加入
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Quick View Modal =====
export const QuickViewModal = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, qty);
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 animate-slide-in max-h-[90vh] overflow-y-auto">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl mb-3 sm:mb-4" 
        />
        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{product.name}</h2>
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{product.description}</p>
        <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">{formatPrice(product.price)}</div>
        <p className="text-gray-500 text-sm mb-3 sm:mb-4">庫存：{product.stock} {product.unit}</p>
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))} 
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg text-lg sm:text-xl hover:bg-gray-200"
          >
            −
          </button>
          <span className="text-lg sm:text-xl font-semibold w-8 text-center">{qty}</span>
          <button 
            onClick={() => setQty(Math.min(product.stock, qty + 1))} 
            className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg text-lg sm:text-xl hover:bg-gray-200"
          >
            +
          </button>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-sm sm:text-base"
          >
            關閉
          </button>
          <button 
            onClick={handleAdd} 
            disabled={product.stock === 0} 
            className={`flex-1 py-2.5 sm:py-3 rounded-xl transition font-semibold text-sm sm:text-base ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
