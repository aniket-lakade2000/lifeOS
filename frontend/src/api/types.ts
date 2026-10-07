// ============================================================================
// Enums & Primitives
// ============================================================================

export type Area = 'CAREER' | 'HEALTH' | 'RELATIONSHIP' | 'FINANCE' | 'PERSONAL_DEVELOPMENT' | 'SPIRITUALITY' | 'FUN_RECREATION' | 'PHYSICAL_ENVIRONMENT' | 'COMMUNITY_INVOLVEMENT';
export type GoalStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

// ============================================================================
// Error Contract (GlobalExceptionHandler)
// ============================================================================

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

// ============================================================================
// Goal DTOs
// ============================================================================

export interface GoalResponse {
  id: number;
  title: string;
  description: string | null;
  area: Area;
  priority: number; // 1 to 3
  status: GoalStatus;
  nextAction: string | null;
  createdAt: string; // Instant (ISO-8601)
  updatedAt: string; // Instant (ISO-8601)
}

export interface CreateGoalRequest {
  title: string; // max 120
  description?: string | null; // max 2000
  area: Area;
  priority: number; // 1 to 3
  nextAction?: string | null; // max 255
}

export interface UpdateGoalRequest {
  title: string; // max 120
  description?: string | null; // max 2000
  priority: number; // 1 to 3
  nextAction?: string | null; // max 255
}

// ============================================================================
// If-Then Plan DTOs
// ============================================================================

export interface IfThenPlanResponse {
  id: number;
  goalId: number;
  planTrigger: string;
  response: string;
  createdAt: string; // Instant (ISO-8601)
  updatedAt: string; // Instant (ISO-8601)
}

export interface CreateIfThenPlanRequest {
  planTrigger: string; // max 255
  response: string; // max 255
}

export interface UpdateIfThenPlanRequest {
  planTrigger: string; // max 255
  response: string; // max 255
}

// ============================================================================
// Check-In DTOs
// ============================================================================

export interface CheckInResponse {
  id: number;
  goalId: number;
  checkDate: string; // LocalDate (YYYY-MM-DD)
  done: boolean;
  note: string | null; // max 500
  createdAt: string; // Instant (ISO-8601)
  updatedAt: string; // Instant (ISO-8601)
}

export interface CreateCheckInRequest {
  checkDate: string; // LocalDate (YYYY-MM-DD)
  done: boolean;
  note?: string | null; // max 500
}

export interface UpdateCheckInRequest {
  done: boolean;
  note?: string | null; // max 500
}