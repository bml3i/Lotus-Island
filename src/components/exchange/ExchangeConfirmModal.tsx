'use client';

import { useState } from 'react';
import { ExchangeRule } from '@/types';

interface ExchangeConfirmModalProps {
  rule: ExchangeRule;
  userQuantity: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function ExchangeConfirmModal({ 
  rule, 
  userQuantity, 
  onConfirm, 
  onCancel 
}: ExchangeConfirmModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [exchanging, setExchanging] = useState(false);

  // 计算最大可兑换次数
  const maxExchanges = Math.floor(userQuantity / rule.fromQuantity);

  // 计算需要消耗的物品数量和获得的物品数量
  const requiredFromQuantity = rule.fromQuantity * quantity;
  const rewardToQuantity = rule.toQuantity * quantity;

  // 处理数量变化
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxExchanges) {
      setQuantity(newQuantity);
    }
  };

  // 处理确认兑换
  const handleConfirm = async () => {
    setExchanging(true);
    try {
      await onConfirm(quantity);
    } finally {
      setExchanging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">确认兑换</h3>
          <button
            onClick={onCancel}
            disabled={exchanging}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 兑换详情 */}
        <div className="space-y-4 mb-6">
          {/* 兑换流程展示 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* 源物品 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                  {rule.fromItem.iconUrl ? (
                    <img 
                      src={rule.fromItem.iconUrl} 
                      alt={rule.fromItem.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{rule.fromItem.name}</p>
                <p className="text-xs text-red-600">消耗 {requiredFromQuantity} 个</p>
              </div>

              {/* 箭头 */}
              <div className="flex flex-col items-center mx-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* 目标物品 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                  {rule.toItem.iconUrl ? (
                    <img 
                      src={rule.toItem.iconUrl} 
                      alt={rule.toItem.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{rule.toItem.name}</p>
                <p className="text-xs text-green-600">获得 {rewardToQuantity} 个</p>
              </div>
            </div>
          </div>

          {/* 数量选择 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              兑换次数
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || exchanging}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min="1"
                  max={maxExchanges}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={exchanging}
                  className="w-20 text-center border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  最多可兑换 {maxExchanges} 次
                </p>
              </div>
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxExchanges || exchanging}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* 余额检查 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">当前拥有：</span>
              <span className="font-medium text-blue-900">{userQuantity} 个 {rule.fromItem.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-blue-700">兑换后剩余：</span>
              <span className="font-medium text-blue-900">
                {userQuantity - requiredFromQuantity} 个 {rule.fromItem.name}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={exchanging}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            取消
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={exchanging}
            className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {exchanging ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                兑换中...
              </div>
            ) : (
              '确认兑换'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}