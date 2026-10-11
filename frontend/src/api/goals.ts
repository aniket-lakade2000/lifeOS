import { request } from './client';
import type { GoalResponse } from './types';

export async function fetchGoals(): Promise<GoalResponse[]> {
  return request<GoalResponse[]>('/api/goals');
}