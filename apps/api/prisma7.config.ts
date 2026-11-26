import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

if (nodeEnv !== 'production') {
  loadEnv({
    path: nodeEnv === 'test' ? '.env.test' : '.env.development',
  });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_URL'),
  },
});
