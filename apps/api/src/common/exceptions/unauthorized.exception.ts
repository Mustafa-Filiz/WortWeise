import { HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.js';
import { AppException } from './app.exception.js';

export class UnauthorizedException extends AppException {
  constructor(message = 'Authentication is required.') {
    super(ERROR_CODES.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
  }
}
