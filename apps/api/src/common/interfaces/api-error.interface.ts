import type { ErrorCode } from '../constants/error-codes.js';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
