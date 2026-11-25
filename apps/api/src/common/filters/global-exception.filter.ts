import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '../constants/error-codes.js';
import type { ErrorCode } from '../constants/error-codes.js';
import type {
  ApiError,
  ApiErrorResponse,
} from '../interfaces/api-error.interface.js';
import { AppException } from '../exceptions/app.exception.js';
import { AppLogger } from '../logger/app-logger.service.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const { status, error } = this.createErrorResponse(exception);

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'http.server_error',
          status,
          code: error.code,
          method: request.method,
          path: request.url,
          exception:
            exception instanceof Error ? exception.name : 'UnknownException',
        }),
        exception instanceof Error ? exception.stack : undefined,
        GlobalExceptionFilter.name,
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error,
    };

    response.status(status).json({
      ...errorResponse,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private createErrorResponse(exception: unknown): {
    status: number;
    error: ApiError;
  } {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        error: {
          code: exception.code,
          message: exception.message,
          ...(exception.details && {
            details: exception.details,
          }),
        },
      };
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred.',
      },
    };
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    error: ApiError;
  } {
    const status = exception.getStatus();

    const code = this.getErrorCode(status);
    const message = this.getSafeMessage(exception, status);

    return {
      status,
      error: {
        code,
        message,
      },
    };
  }

  private getErrorCode(status: number): ErrorCode {
    const errorCodes: Partial<Record<number, ErrorCode>> = {
      400: ERROR_CODES.BAD_REQUEST,
      401: ERROR_CODES.UNAUTHORIZED,
      403: ERROR_CODES.FORBIDDEN,
      404: ERROR_CODES.NOT_FOUND,
      409: ERROR_CODES.CONFLICT,
      422: ERROR_CODES.VALIDATION_ERROR,
      429: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      503: ERROR_CODES.SERVICE_UNAVAILABLE,
    };

    return (
      errorCodes[status] ??
      (status >= 500
        ? ERROR_CODES.INTERNAL_SERVER_ERROR
        : ERROR_CODES.BAD_REQUEST)
    );
  }

  private getSafeMessage(exception: HttpException, status: number): string {
    if (status >= 500) {
      return 'An unexpected error occurred.';
    }

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      typeof exceptionResponse.message === 'string'
    ) {
      return exceptionResponse.message;
    }

    return exception.message;
  }
}
