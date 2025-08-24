'use client';

import { useState } from 'react';
import { ItemCard } from '@/components/backpack/ItemCard';
import { Item } from '@/types';

export default function TestBackpackPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [itemId: string]: number }>({});
  const [clickLog, setClickLog] = useState<string[]>([]);

  // 模拟物品数据
  const testItems = [
    {
      id: '1',
      name: '测试物品1',
      description: '这是一个测试物品',
      iconUrl: '',
      isUsable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      quantity: 5
    },
    {
      id: '2', 
      name: '测试物品2',
      description: '这是另一个测试物品',
      iconUrl: '',
      isUsable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      quantity: 3
    },
    {
      id: '3',
      name: '不可用物品',
      description: '这个物品不可使用',
      iconUrl: '',
      isUsable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      quantity: 2
    }
  ];

  const handleItemSelect = (itemId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + '.' + now.getMilliseconds();
    
    setClickLog(prev => [...prev, `${timeStr}: 点击物品 ${itemId}`]);
    
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // 取消选择时也清除数量
        setSelectedQuantities(prevQty => {
          const newQty = { ...prevQty };
          delete newQty[itemId];
          return newQty;
        });
        return prev.filter(id => id !== itemId);
      } else {
        // 选择时设置初始数量为1
        setSelectedQuantities(prevQty => ({ ...prevQty, [itemId]: 1 }));
        return [...prev, itemId];
      }
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + '.' + now.getMilliseconds();
    
    setClickLog(prev => [...prev, `${timeStr}: 调整物品 ${itemId} 数量为 ${quantity}`]);
    
    if (quantity <= 0) {
      // 数量为0时取消选择
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      setSelectedQuantities(prev => {
        const newQty = { ...prev };
        delete newQty[itemId];
        return newQty;
      });
    } else {
      setSelectedQuantities(prev => ({ ...prev, [itemId]: quantity }));
    }
  };

  const clearLog = () => {
    setClickLog([]);
    setSelectedItems([]);
    setSelectedQuantities({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-4">背包物品选择测试</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {testItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                quantity={item.quantity}
                isSelected={selectedItems.includes(item.id)}
                selectedQuantity={selectedQuantities[item.id] || 0}
                onSelect={handleItemSelect}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">已选择物品:</h3>
              <div className="text-sm text-gray-600">
                {selectedItems.length > 0 ? (
                  selectedItems.map(itemId => (
                    <div key={itemId} className="flex justify-between">
                      <span>物品 {itemId}</span>
                      <span>数量: {selectedQuantities[itemId] || 0}</span>
                    </div>
                  ))
                ) : (
                  <p>无</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">点击日志:</h3>
                <button
                  onClick={clearLog}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  清空日志
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {clickLog.length > 0 ? (
                  <div className="space-y-1">
                    {clickLog.slice(-10).map((log, index) => (
                      <p key={index} className="text-xs text-gray-600 font-mono">
                        {log}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">暂无点击记录</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">测试说明:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 在移动设备上点击可用物品（绿色&quot;可用&quot;标签）</li>
              <li>• 选择物品后，使用 + 和 - 按钮调整数量</li>
              <li>• 观察物品选择状态和点击日志</li>
              <li>• 单次点击应该只产生一条日志记录</li>
              <li>• 调整数量时物品不应该被取消选择</li>
              <li>• 物品选择状态应该稳定切换，不会闪烁</li>
              <li>• 不可用物品（灰色）应该无法点击</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}