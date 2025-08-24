'use client';

import { Item } from '@/types';
import { TouchFeedback } from '@/components/ui/TouchFeedback';

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

  const handleQuantityIncrease = () => {
    if (!disabled && onQuantityChange && selectedQuantity < quantity) {
      onQuantityChange(item.id, selectedQuantity + 1);
    }
  };

  const handleQuantityDecrease = () => {
    if (!disabled && onQuantityChange && selectedQuantity > 0) {
      onQuantityChange(item.id, selectedQuantity - 1);
    }
  };

  return (
    <TouchFeedback
      onPress={handleCardClick}
      disabled={disabled || !item.isUsable}
      hapticFeedback={true}
      pressScale={0.95}
      className={`
        relative bg-white rounded-lg border-2 p-3 sm:p-4 transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${!item.isUsable ? 'opacity-60' : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {/* 物品图标 */}
      <div className="flex justify-center mb-2 sm:mb-3">
        {item.iconUrl ? (
          <img 
            src={item.iconUrl} 
            alt={item.name}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-base sm:text-lg">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* 物品名称 */}
      <h3 className="text-xs sm:text-sm font-medium text-gray-900 text-center mb-1 truncate">
        {item.name}
      </h3>

      {/* 物品描述 - 仅在较大屏幕显示 */}
      {item.description && (
        <p className="hidden sm:block text-xs text-gray-500 text-center mb-2 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* 数量显示 */}
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs sm:text-sm text-gray-600">
          <span className="font-medium text-gray-900">{quantity}</span>
        </span>
      </div>

      {/* 可使用标识 */}
      {item.isUsable && (
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            可用
          </span>
        </div>
      )}

      {/* 选择数量控制 */}
      {isSelected && item.isUsable && onQuantityChange && (
        <div 
          className="flex items-center justify-center space-x-1 sm:space-x-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <TouchFeedback
            onPress={handleQuantityDecrease}
            disabled={selectedQuantity <= 0 || disabled}
            hapticFeedback={true}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:bg-gray-300 transition-colors"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </TouchFeedback>
          
          <span className="min-w-[1.5rem] sm:min-w-[2rem] text-center font-medium text-blue-600 text-sm">
            {selectedQuantity}
          </span>
          
          <TouchFeedback
            onPress={handleQuantityIncrease}
            disabled={selectedQuantity >= quantity || disabled}
            hapticFeedback={true}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:bg-gray-300 transition-colors"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </TouchFeedback>
        </div>
      )}

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </TouchFeedback>
  );
}