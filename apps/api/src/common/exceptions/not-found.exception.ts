import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.js';
import { AppException } from './app.exception.js';

export class ResourceNotFoundException extends AppException {
  constructor(resource: string) {
    super(
      ERROR_CODES.NOT_FOUND,
      `${resource} not found.`,
      HttpStatus.NOT_FOUND,
    );
  }
}
