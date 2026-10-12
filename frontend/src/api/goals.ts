import { request } from './client';
import type { CreateGoalRequest, GoalResponse, UpdateGoalRequest } from './types';

export async function fetchGoals(): Promise<GoalResponse[]> {
  return request<GoalResponse[]>('/api/goals');
}

export async function createGoal(
  payload: CreateGoalRequest
): Promise<GoalResponse> {
  return request<GoalResponse>('/api/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGoal(
  id: number,
  payload: UpdateGoalRequest
): Promise<GoalResponse> {
  return request<GoalResponse>(`/api/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}