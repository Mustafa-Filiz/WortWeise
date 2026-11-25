import { HttpException } from '@nestjs/common';
import type { HttpStatus } from '@nestjs/common';
import type { ApiErrorDetail } from '../interfaces/api-error.interface.js';
import type { ErrorCode } from '../constants/error-codes.js';

export abstract class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    status: HttpStatus,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message, status);
  }
}
