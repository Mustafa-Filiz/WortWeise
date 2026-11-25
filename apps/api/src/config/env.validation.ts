import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
