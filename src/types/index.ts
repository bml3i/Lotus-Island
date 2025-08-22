// User types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Item types
export interface Item {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isUsable: boolean;
  createdAt: Date;
}

// Backpack types
export interface BackpackItem {
  id: string;
  userId: string;
  item: Item;
  quantity: number;
  updatedAt: Date;
}

// Usage history types
export interface UsageHistory {
  id: string;
  userId: string;
  item: Item;
  quantityUsed: number;
  usedAt: Date;
}

// Activity types
export interface Activity {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
}

// Exchange rule types
export interface ExchangeRule {
  id: string;
  fromItem: Item;
  toItem: Item;
  fromQuantity: number;
  toQuantity: number;
  isActive: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}