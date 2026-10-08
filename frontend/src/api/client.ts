import type { ApiErrorResponse } from './types';

const STORAGE_KEY = 'lifeos_auth_token';

// --- Auth Token Management ---

export function getAuthToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAuthToken(username: string, password: string): void {
  // Store standard Base64 Basic auth credentials: "username:password"
  const token = btoa(`${username}:${password}`);
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// --- Custom Error Class ---

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly path: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(payload: ApiErrorResponse) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.error = payload.error;
    this.path = payload.path;
    this.fieldErrors = payload.fieldErrors;
  }
}

// --- Generic Request Wrapper ---

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Basic ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized: wipe invalid credentials immediately
  if (response.status === 401) {
    clearAuthToken();
  }

  if (!response.ok) {
    let payload: ApiErrorResponse;
    try {
      payload = await response.json();
    } catch {
      payload = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: 'An unexpected network error occurred.',
        path: endpoint,
      };
    }
    throw new ApiError(payload);
  }

  // 204 No Content support (e.g. DELETE endpoints)
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}