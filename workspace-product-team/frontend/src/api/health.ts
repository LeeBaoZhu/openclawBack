// API 调用模块 - 健康仪表盘

import axios from 'axios';
import type { HealthDashboard, TrendResponse, AlertListResponse, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

/**
 * 获取健康度仪表盘数据
 */
export async function getHealthDashboard(): Promise<ApiResponse<HealthDashboard>> {
  const response = await api.get('/health/dashboard');
  return response.data;
}

/**
 * 获取告警趋势数据
 * @param days 天数（7 或 30）
 */
export async function getHealthTrends(days: number = 7): Promise<ApiResponse<TrendResponse>> {
  const response = await api.get('/health/trends', { params: { days } });
  return response.data;
}

/**
 * 获取告警列表
 * @param limit 每页数量
 * @param offset 偏移量
 * @param level 过滤级别
 */
export async function getHealthAlerts(
  limit: number = 10,
  offset: number = 0,
  level?: 'error' | 'warning' | 'fatal'
): Promise<ApiResponse<AlertListResponse>> {
  const params: Record<string, any> = { limit, offset };
  if (level) params.level = level;
  
  const response = await api.get('/health/alerts', { params });
  return response.data;
}
