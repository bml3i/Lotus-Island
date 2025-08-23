'use client';

import { useState } from 'react';
import { Activity } from '@/types';
import { ActivityService } from '@/lib/services/activity-service';

interface ActivityConfigFormProps {
  activity?: Activity;
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

export default function ActivityConfigForm({ 
  activity, 
  onSave, 
  onCancel 
}: ActivityConfigFormProps) {
  const [formData, setFormData] = useState({
    name: activity?.name || '',
    type: activity?.type || 'checkin',
    config: activity?.config || ActivityService.getDefaultConfig('checkin'),
    isActive: activity?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 验证配置
      if (!ActivityService.validateActivityConfig(formData.type, formData.config)) {
        throw new Error('活动配置验证失败');
      }

      const url = activity 
        ? `/api/activities/${activity.id}`
        : '/api/activities';
      
      const method = activity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '保存活动配置失败');
      }

      onSave(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存活动配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type,
      config: ActivityService.getDefaultConfig(type)
    });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        [key]: value
      }
    });
  };

  const renderConfigFields = () => {
    const config = formData.config as Record<string, unknown>;
    
    switch (formData.type) {
      case 'checkin':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                奖励数量
              </label>
              <input
                type="number"
                min="1"
                value={(config.reward as number) || 5}
                onChange={(e) => handleConfigChange('reward', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                奖励物品ID
              </label>
              <input
                type="text"
                value={(config.itemId as string) || 'lotus-seed'}
                onChange={(e) => handleConfigChange('itemId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                描述
              </label>
              <textarea
                value={(config.description as string) || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        );
      
      case 'exchange':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  源物品ID
                </label>
                <input
                  type="text"
                  value={(config.fromItemId as string) || ''}
                  onChange={(e) => handleConfigChange('fromItemId', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  目标物品ID
                </label>
                <input
                  type="text"
                  value={(config.toItemId as string) || ''}
                  onChange={(e) => handleConfigChange('toItemId', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  源物品数量
                </label>
                <input
                  type="number"
                  min="1"
                  value={(config.fromQuantity as number) || 1}
                  onChange={(e) => handleConfigChange('fromQuantity', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  目标物品数量
                </label>
                <input
                  type="number"
                  min="1"
                  value={(config.toQuantity as number) || 1}
                  onChange={(e) => handleConfigChange('toQuantity', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                描述
              </label>
              <textarea
                value={(config.description as string) || ''}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              配置 (JSON)
            </label>
            <textarea
              value={JSON.stringify(formData.config, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  setFormData({ ...formData, config });
                } catch {
                  // 忽略无效的JSON
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
              rows={6}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {activity ? '编辑活动配置' : '创建新活动'}
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            活动名称
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            活动类型
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="checkin">每日签到</option>
            <option value="exchange">物品兑换</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        {renderConfigFields()}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            启用活动
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}