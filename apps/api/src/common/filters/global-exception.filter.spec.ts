import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { AppLogger } from '../logger/app-logger.service.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { ValidationException } from '../exceptions/validation.exception.js';
import { ResourceNotFoundException } from '../exceptions/not-found.exception.js';
import { UnauthorizedException } from '../exceptions/unauthorized.exception.js';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

  let mockRequest: Partial<Request>;

  let host: ArgumentsHost;

  let mockLogger: {
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      log: vi.fn(),
      debug: vi.fn(),
    };

    filter = new GlobalExceptionFilter(mockLogger as unknown as AppLogger);

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };

    host = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as unknown as Response,
        getRequest: () => mockRequest as Request,
      }),
    } as ArgumentsHost;
  });

  it('should handle custom application exceptions', () => {
    const exception = new ResourceNotFoundException('User');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'User not found.',
        },
        path: '/api/test',
      }),
    );
  });

  it('should handle unauthorized exceptions', () => {
    const exception = new UnauthorizedException();

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authentication is required.',
        },
      }),
    );
  });

  it('should handle standard NestJS HTTP exceptions', () => {
    const exception = new HttpException(
      'Resource not found',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
      }),
    );
  });

  it('should handle validation exceptions with details', () => {
    const exception = new ValidationException([
      {
        field: 'email',
        message: 'Invalid email address.',
      },
    ]);

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'The provided data is invalid.',
          details: [
            {
              field: 'email',
              message: 'Invalid email address.',
            },
          ],
        },
      }),
    );
  });

  it('should hide internal server error details', () => {
    const exception = new Error('Database connection failed: password=secret');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred.',
        },
      }),
    );
  });

  it('should hide internal details from NestJS 500 exceptions', () => {
    const exception = new HttpException(
      'Sensitive internal information',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred.',
        },
      }),
    );
  });

  it('should include a valid ISO timestamp', () => {
    filter.catch(new ResourceNotFoundException('Word'), host);

    const response = mockResponse.json.mock.calls[0][0] as {
      timestamp: string;
    };

    expect(response.timestamp).toBeDefined();
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
  });

  it('should map 503 status to SERVICE_UNAVAILABLE', () => {
    const exception = new HttpException(
      'Service unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(503);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ERROR_CODES.SERVICE_UNAVAILABLE,
          message: 'An unexpected error occurred.',
        },
      }),
    );
  });

  it('should log internal server errors', () => {
    const exception = new Error('Database connection failed');

    filter.catch(exception, host);

    expect(mockLogger.error).toHaveBeenCalledOnce();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('http.server_error'),
      exception.stack,
      'GlobalExceptionFilter',
    );
  });
});
