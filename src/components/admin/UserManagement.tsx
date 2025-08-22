'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

interface UserFormData {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

interface UserManagementProps {
  onClose?: () => void;
}

export default function UserManagement({ onClose }: UserManagementProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user'
  });
  const [formLoading, setFormLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || '获取用户列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 创建用户
  const createUser = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setUsers([result.data, ...users]);
        setShowCreateForm(false);
        resetForm();
        setError(null);
      } else {
        setError(result.error || '创建用户失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  // 更新用户
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      setFormLoading(true);
      const updateData: Partial<UserFormData> = {
        username: formData.username,
        role: formData.role,
      };

      // 只有密码不为空时才更新密码
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? result.data : user
        ));
        setEditingUser(null);
        resetForm();
        setError(null);
      } else {
        setError(result.error || '更新用户失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setFormLoading(false);
    }
  };

  // 删除用户
  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
        setError(null);
      } else {
        setError(result.error || '删除用户失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'user'
    });
  };

  // 开始编辑用户
  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setShowCreateForm(true);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    resetForm();
    setError(null);
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser();
    } else {
      createUser();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">用户管理</h2>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none"
          >
            创建用户
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? '编辑用户' : '创建新用户'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {editingUser && <span className="text-gray-500">(留空则不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required={!editingUser}
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none"
              >
                {formLoading ? '处理中...' : (editingUser ? '更新' : '创建')}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无用户</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">角色</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{user.username}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.username)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.username}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors p-2"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors p-2"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    创建时间: {new Date(user.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}