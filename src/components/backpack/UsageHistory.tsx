'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UsageHistory as UsageHistoryType } from '@/types';

interface UsageHistoryProps {
  itemId?: string;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UsageHistory({ itemId, limit = 10 }: UsageHistoryProps) {
  const { token } = useAuth();
  const [history, setHistory] = useState<UsageHistoryType[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取使用历史
  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (itemId) {
        params.append('itemId', itemId);
      }

      const response = await fetch(`/api/backpack/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
        setPagination(result.pagination);
        setError(null);
      } else {
        setError(result.error || '获取使用历史失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, itemId, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">加载历史记录...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">使用历史</h3>
        {pagination.total > 0 && (
          <span className="text-sm text-gray-500">
            共 {pagination.total} 条记录
          </span>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 历史记录列表 */}
      {history.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500">暂无使用记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* 物品图标 */}
                  <div className="flex-shrink-0">
                    {record.item.iconUrl ? (
                      <img 
                        src={record.item.iconUrl} 
                        alt={record.item.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {record.item.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 使用信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {record.item.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        使用了 {record.quantityUsed} 个
                      </span>
                    </div>
                    
                    {record.item.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {record.item.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      {formatDate(record.usedAt.toString())}
                    </p>
                  </div>
                </div>

                {/* 使用时间（移动端隐藏，桌面端显示） */}
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(record.usedAt).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页控件 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            
            <span className="text-sm text-gray-600">
              第 {pagination.page} 页，共 {pagination.totalPages} 页
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            显示 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
          </div>
        </div>
      )}
    </div>
  );
}