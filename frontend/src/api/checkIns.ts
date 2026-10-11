import { request } from './client';
import type {
  CheckInResponse,
  CreateCheckInRequest,
  UpdateCheckInRequest,
} from './types';

/**
 * Returns local date in YYYY-MM-DD format (avoids UTC offset bugs)
 */
export function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function fetchCheckIns(
  goalId: number,
  from?: string,
  to?: string
): Promise<CheckInResponse[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const query = params.toString();
  const endpoint = `/api/goals/${goalId}/check-ins${query ? `?${query}` : ''}`;
  return request<CheckInResponse[]>(endpoint);
}

export async function createCheckIn(
  goalId: number,
  payload: CreateCheckInRequest
): Promise<CheckInResponse> {
  return request<CheckInResponse>(`/api/goals/${goalId}/check-ins`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCheckIn(
  goalId: number,
  checkInId: number,
  payload: UpdateCheckInRequest
): Promise<CheckInResponse> {
  return request<CheckInResponse>(
    `/api/goals/${goalId}/check-ins/${checkInId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
}