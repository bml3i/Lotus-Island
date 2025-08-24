'use client';

import { useState } from 'react';
import { TouchFeedback } from '@/components/ui/TouchFeedback';

export default function TestTouchPage() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<string>('');

  const handleClick = () => {
    const now = new Date();
    setClickCount(prev => prev + 1);
    setLastClickTime(now.toLocaleTimeString() + '.' + now.getMilliseconds());
  };

  const resetCount = () => {
    setClickCount(0);
    setLastClickTime('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-4">触摸事件测试</h1>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">点击次数:</p>
              <p className="text-3xl font-bold text-blue-600">{clickCount}</p>
              <p className="text-xs text-gray-500 mt-1">最后点击: {lastClickTime}</p>
            </div>

            <TouchFeedback
              onPress={handleClick}
              className="w-full bg-blue-500 text-white rounded-lg p-4 text-center font-medium"
            >
              点击测试按钮
            </TouchFeedback>

            <button
              onClick={resetCount}
              className="w-full bg-gray-500 text-white rounded-lg p-2 text-sm"
            >
              重置计数
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">测试说明:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 在移动设备上单击蓝色按钮</li>
              <li>• 观察点击次数是否正确递增</li>
              <li>• 如果单次点击导致计数增加2次，说明存在重复触发问题</li>
              <li>• 修复后应该每次点击只增加1次</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}