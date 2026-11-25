import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.js';
import { AppException } from './app.exception.js';

export class ForbiddenException extends AppException {
  constructor(message = 'You do not have permission to perform this action.') {
    super(ERROR_CODES.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}
