import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.js';
import type { ApiErrorDetail } from '../interfaces/api-error.interface.js';
import { AppException } from './app.exception.js';

export class ValidationException extends AppException {
  constructor(details: ApiErrorDetail[]) {
    super(
      ERROR_CODES.VALIDATION_ERROR,
      'The provided data is invalid.',
      HttpStatus.UNPROCESSABLE_ENTITY,
      details,
    );
  }
}
