// API 调用模块 - Cron 任务

import axios from 'axios';
import type { CronJob, CronJobDetail, CronStats, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

/**
 * 获取 Cron 任务列表
 */
export async function getCronJobs(): Promise<ApiResponse<{ jobs: CronJob[]; stats: CronStats }>> {
  const response = await api.get('/cron/jobs');
  return response.data;
}

/**
 * 获取单个任务详情
 */
export async function getCronJobDetail(id: string): Promise<ApiResponse<CronJobDetail>> {
  const response = await api.get(`/cron/jobs/${id}`);
  return response.data;
}

/**
 * 手动触发任务执行
 */
export async function runCronJob(id: string): Promise<ApiResponse<{ runId: string; estimatedDurationMs: number }>> {
  const response = await api.post(`/cron/jobs/${id}/run`);
  return response.data;
}

/**
 * 启用/禁用任务
 */
export async function toggleCronJob(id: string, enabled: boolean): Promise<ApiResponse<{ id: string; enabled: boolean; updatedAt: string }>> {
  const response = await api.put(`/cron/jobs/${id}`, { enabled });
  return response.data;
}
