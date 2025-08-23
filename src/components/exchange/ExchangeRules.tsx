'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExchangeRule, BackpackItem } from '@/types';
import { ExchangeRuleCard } from './ExchangeRuleCard';
import { ExchangeConfirmModal } from './ExchangeConfirmModal';

interface ExchangeRulesProps {
  onExchangeSuccess?: () => void;
}

export function ExchangeRules({ onExchangeSuccess }: ExchangeRulesProps) {
  const { token } = useAuth();
  const [exchangeRules, setExchangeRules] = useState<ExchangeRule[]>([]);
  const [backpackItems, setBackpackItems] = useState<BackpackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRule, setSelectedRule] = useState<ExchangeRule | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 获取兑换规则
  const fetchExchangeRules = async () => {
    try {
      const response = await fetch('/api/activities/exchange', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setExchangeRules(result.data);
      } else {
        setError(result.error || '获取兑换规则失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  // 获取背包物品
  const fetchBackpackItems = async () => {
    try {
      const response = await fetch('/api/backpack', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setBackpackItems(result.data);
      } else {
        setError(result.error || '获取背包物品失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  // 获取用户拥有的指定物品数量
  const getUserItemQuantity = (itemId: string): number => {
    const userItem = backpackItems.find(item => item.item.id === itemId);
    return userItem?.quantity || 0;
  };

  // 检查是否可以兑换
  const canExchange = (rule: ExchangeRule): boolean => {
    const userQuantity = getUserItemQuantity(rule.fromItem.id);
    return userQuantity >= rule.fromQuantity;
  };

  // 处理兑换点击
  const handleExchangeClick = (rule: ExchangeRule) => {
    if (!canExchange(rule)) {
      setError(`${rule.fromItem.name}数量不足，需要${rule.fromQuantity}个，当前只有${getUserItemQuantity(rule.fromItem.id)}个`);
      return;
    }
    
    setSelectedRule(rule);
    setShowConfirmModal(true);
    setError(null);
  };

  // 确认兑换
  const handleConfirmExchange = async (quantity: number) => {
    if (!selectedRule) return;

    try {
      const response = await fetch('/api/activities/exchange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchangeRuleId: selectedRule.id,
          quantity,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage(result.message || '兑换成功');
        setShowConfirmModal(false);
        setSelectedRule(null);
        
        // 刷新数据
        await Promise.all([fetchExchangeRules(), fetchBackpackItems()]);
        
        // 通知父组件
        if (onExchangeSuccess) {
          onExchangeSuccess();
        }
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || '兑换失败');
        setShowConfirmModal(false);
        setSelectedRule(null);
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      setShowConfirmModal(false);
      setSelectedRule(null);
    }
  };

  // 取消兑换
  const handleCancelExchange = () => {
    setShowConfirmModal(false);
    setSelectedRule(null);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchExchangeRules(), fetchBackpackItems()]);
      setLoading(false);
    };
    
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">加载兑换规则中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* 兑换说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">兑换说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 选择合适的兑换规则进行物品兑换</li>
          <li>• 确保你有足够的源物品数量</li>
          <li>• 兑换后源物品将被消耗，目标物品将添加到背包</li>
          <li>• 可以选择兑换数量（如果有足够的物品）</li>
        </ul>
      </div>

      {/* 兑换规则列表 */}
      {exchangeRules.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">暂无可用的兑换规则</p>
          <p className="text-gray-400 text-sm">请稍后再来查看</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exchangeRules.map((rule) => (
            <ExchangeRuleCard
              key={rule.id}
              rule={rule}
              userQuantity={getUserItemQuantity(rule.fromItem.id)}
              canExchange={canExchange(rule)}
              onExchange={() => handleExchangeClick(rule)}
            />
          ))}
        </div>
      )}

      {/* 兑换确认弹窗 */}
      {showConfirmModal && selectedRule && (
        <ExchangeConfirmModal
          rule={selectedRule}
          userQuantity={getUserItemQuantity(selectedRule.fromItem.id)}
          onConfirm={handleConfirmExchange}
          onCancel={handleCancelExchange}
        />
      )}
    </div>
  );
}