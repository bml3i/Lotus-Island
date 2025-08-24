'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BackpackItem } from '@/types';
import { ItemCard } from './ItemCard';

interface ItemSelectorProps {
  onUseSuccess?: () => void;
}

interface SelectedItem {
  itemId: string;
  quantity: number;
}

export function ItemSelector({ onUseSuccess }: ItemSelectorProps) {
  const { token } = useAuth();
  const [backpackItems, setBackpackItems] = useState<BackpackItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const lastSelectTimeRef = useRef<{ [itemId: string]: number }>({});

  // 获取背包物品
  const fetchBackpackItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backpack', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setBackpackItems(result.data);
        setError(null);
      } else {
        setError(result.error || '获取背包物品失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 选择物品
  const handleItemSelect = (itemId: string) => {
    // 防抖保护：防止快速重复点击
    const now = Date.now();
    const lastSelectTime = lastSelectTimeRef.current[itemId] || 0;
    
    if (now - lastSelectTime < 500) {
      return; // 忽略500ms内的重复点击
    }
    
    lastSelectTimeRef.current[itemId] = now;
    
    const existingIndex = selectedItems.findIndex(item => item.itemId === itemId);
    
    if (existingIndex >= 0) {
      // 如果已选择，则取消选择
      setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
    } else {
      // 如果未选择，则添加选择（初始数量为1）
      setSelectedItems([...selectedItems, { itemId, quantity: 1 }]);
    }
  };

  // 更改选择数量
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // 数量为0时移除选择
      setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
    } else {
      // 更新数量
      setSelectedItems(selectedItems.map(item => 
        item.itemId === itemId ? { ...item, quantity } : item
      ));
    }
  };

  // 使用物品
  const handleUseItems = async () => {
    if (selectedItems.length !== 1) {
      setError('请选择一种物品进行使用');
      return;
    }

    const selectedItem = selectedItems[0];
    
    try {
      setUsing(true);
      setError(null);
      
      const response = await fetch('/api/backpack/use', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: selectedItem.itemId,
          quantity: selectedItem.quantity
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(result.message || '物品使用成功');
        setSelectedItems([]);
        
        // 刷新背包物品
        await fetchBackpackItems();
        
        // 通知父组件
        if (onUseSuccess) {
          onUseSuccess();
        }
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || '使用物品失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setUsing(false);
    }
  };

  // 清除选择
  const handleClearSelection = () => {
    setSelectedItems([]);
    setError(null);
  };

  // 获取选中物品的信息
  const getSelectedItemInfo = (itemId: string) => {
    return selectedItems.find(item => item.itemId === itemId);
  };

  // 检查是否可以使用
  const canUse = selectedItems.length === 1 && selectedItems[0].quantity > 0;

  useEffect(() => {
    fetchBackpackItems();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">加载背包中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">使用说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 点击可使用的物品进行选择</li>
          <li>• 调整选择数量后点击&quot;使用&quot;按钮</li>
          <li>• 每次只能选择一种物品进行使用</li>
        </ul>
      </div>

      {/* 物品网格 */}
      {backpackItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">背包空空如也</p>
          <p className="text-gray-400 text-sm">完成任务或签到获得物品吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {backpackItems.map((backpackItem) => {
            const selectedInfo = getSelectedItemInfo(backpackItem.item.id);
            return (
              <ItemCard
                key={backpackItem.id}
                item={backpackItem.item}
                quantity={backpackItem.quantity}
                isSelected={!!selectedInfo}
                selectedQuantity={selectedInfo?.quantity || 0}
                onSelect={handleItemSelect}
                onQuantityChange={handleQuantityChange}
                disabled={using}
              />
            );
          })}
        </div>
      )}

      {/* 操作按钮 */}
      {selectedItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                已选择 {selectedItems.length} 种物品
              </p>
              {selectedItems.length > 1 && (
                <p className="text-xs text-orange-600">
                  每次只能使用一种物品，请重新选择
                </p>
              )}
            </div>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={handleClearSelection}
                disabled={using}
                className="flex-1 sm:flex-none px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                清除选择
              </button>
              
              <button
                onClick={handleUseItems}
                disabled={!canUse || using}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
              >
                {using ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    使用中...
                  </div>
                ) : (
                  '使用'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}