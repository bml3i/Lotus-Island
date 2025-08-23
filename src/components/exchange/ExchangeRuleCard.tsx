'use client';

import { ExchangeRule } from '@/types';

interface ExchangeRuleCardProps {
  rule: ExchangeRule;
  userQuantity: number;
  canExchange: boolean;
  onExchange: () => void;
}

export function ExchangeRuleCard({ 
  rule, 
  userQuantity, 
  canExchange, 
  onExchange 
}: ExchangeRuleCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* 兑换流程展示 */}
      <div className="flex items-center justify-between mb-4">
        {/* 源物品 */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
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
          <p className="text-xs text-gray-500">需要 {rule.fromQuantity} 个</p>
          <p className="text-xs text-blue-600">拥有 {userQuantity} 个</p>
        </div>

        {/* 箭头 */}
        <div className="flex flex-col items-center mx-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* 目标物品 */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
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
          <p className="text-xs text-green-600">获得 {rule.toQuantity} 个</p>
        </div>
      </div>

      {/* 物品描述 */}
      <div className="space-y-2 mb-4">
        {rule.fromItem.description && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">源物品：</span>
            {rule.fromItem.description}
          </div>
        )}
        {rule.toItem.description && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">目标物品：</span>
            {rule.toItem.description}
          </div>
        )}
      </div>

      {/* 兑换比例 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">兑换比例</p>
          <p className="text-lg font-semibold text-gray-900">
            {rule.fromQuantity} : {rule.toQuantity}
          </p>
        </div>
      </div>

      {/* 状态提示 */}
      {!canExchange && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-orange-700 text-xs">
              {rule.fromItem.name}数量不足
            </p>
          </div>
        </div>
      )}

      {/* 兑换按钮 */}
      <button
        onClick={onExchange}
        disabled={!canExchange}
        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
          canExchange
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canExchange ? '立即兑换' : '物品不足'}
      </button>
    </div>
  );
}