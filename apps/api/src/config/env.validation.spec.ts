import { describe, expect, it } from 'vitest';
import { getEnvFilePath, validateEnv } from './env.validation.js';

const validDatabaseEnv = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/wortweise',
  DIRECT_URL: 'postgresql://user:password@localhost:5432/wortweise',
};

describe('validateEnv', () => {
  it('should apply default values', () => {
    const result = validateEnv(validDatabaseEnv);

    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      CORS_ORIGIN: 'http://localhost:3000',
      ...validDatabaseEnv,
    });
  });

  it('should validate provided environment variables', () => {
    const result = validateEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ORIGIN: 'https://wortweise.com',
      ...validDatabaseEnv,
    });

    expect(result).toEqual({
      NODE_ENV: 'production',
      PORT: 8080,
      CORS_ORIGIN: 'https://wortweise.com',
      ...validDatabaseEnv,
    });
  });

  it('should reject an invalid NODE_ENV', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'staging',
      }),
    ).toThrow();
  });

  it('should reject an invalid PORT', () => {
    expect(() =>
      validateEnv({
        PORT: '70000',
      }),
    ).toThrow();
  });

  it('should reject a non-numeric PORT', () => {
    expect(() =>
      validateEnv({
        PORT: 'invalid',
      }),
    ).toThrow();
  });
});

describe('getEnvFilePath', () => {
  it('should return development env file by default', () => {
    expect(getEnvFilePath(undefined)).toEqual(['.env.development']);
  });

  it('should return test env file', () => {
    expect(getEnvFilePath('test')).toEqual(['.env.test']);
  });

  it('should not load env files in production', () => {
    expect(getEnvFilePath('production')).toEqual([]);
  });
});
