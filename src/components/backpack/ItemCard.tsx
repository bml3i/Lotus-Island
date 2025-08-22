'use client';

import { Item } from '@/types';

interface ItemCardProps {
  item: Item;
  quantity: number;
  isSelected?: boolean;
  selectedQuantity?: number;
  onSelect?: (itemId: string) => void;
  onQuantityChange?: (itemId: string, quantity: number) => void;
  disabled?: boolean;
}

export function ItemCard({ 
  item, 
  quantity, 
  isSelected = false, 
  selectedQuantity = 0,
  onSelect, 
  onQuantityChange,
  disabled = false 
}: ItemCardProps) {
  const handleCardClick = () => {
    if (!disabled && item.isUsable && onSelect) {
      onSelect(item.id);
    }
  };

  const handleQuantityIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onQuantityChange && selectedQuantity < quantity) {
      onQuantityChange(item.id, selectedQuantity + 1);
    }
  };

  const handleQuantityDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onQuantityChange && selectedQuantity > 0) {
      onQuantityChange(item.id, selectedQuantity - 1);
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${!item.isUsable ? 'opacity-60 cursor-not-allowed' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* 物品图标 */}
      <div className="flex justify-center mb-3">
        {item.iconUrl ? (
          <img 
            src={item.iconUrl} 
            alt={item.name}
            className="w-12 h-12 object-contain"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* 物品名称 */}
      <h3 className="text-sm font-medium text-gray-900 text-center mb-1 truncate">
        {item.name}
      </h3>

      {/* 物品描述 */}
      {item.description && (
        <p className="text-xs text-gray-500 text-center mb-2 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* 数量显示 */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-sm text-gray-600">
          拥有: <span className="font-medium text-gray-900">{quantity}</span>
        </span>
      </div>

      {/* 可使用标识 */}
      {item.isUsable && (
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            可使用
          </span>
        </div>
      )}

      {/* 选择数量控制 */}
      {isSelected && item.isUsable && onQuantityChange && (
        <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-blue-200">
          <button
            onClick={handleQuantityDecrease}
            disabled={selectedQuantity <= 0 || disabled}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="min-w-[2rem] text-center font-medium text-blue-600">
            {selectedQuantity}
          </span>
          
          <button
            onClick={handleQuantityIncrease}
            disabled={selectedQuantity >= quantity || disabled}
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      )}

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}