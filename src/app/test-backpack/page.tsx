'use client';

import { useState } from 'react';
import { ItemCard } from '@/components/backpack/ItemCard';
import { Item } from '@/types';

export default function TestBackpackPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const clearLog = () => {
    setClickLog([]);
    setSelectedItems([]);
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
                onSelect={handleItemSelect}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">已选择物品:</h3>
              <p className="text-sm text-gray-600">
                {selectedItems.length > 0 ? selectedItems.join(', ') : '无'}
              </p>
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
              <li>• 观察物品选择状态和点击日志</li>
              <li>• 单次点击应该只产生一条日志记录</li>
              <li>• 物品选择状态应该稳定切换，不会闪烁</li>
              <li>• 不可用物品（灰色）应该无法点击</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}