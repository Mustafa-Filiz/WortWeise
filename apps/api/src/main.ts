import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationException } from './common/exceptions/index.js';
import type { Environment } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService =
    app.get<ConfigService<Environment, true>>(ConfigService);

  const port = configService.get('PORT', { infer: true });
  const corsOrigin = configService.get('CORS_ORIGIN', { infer: true });

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const details = errors.map((error) => ({
          field: error.property,
          message: error.constraints
            ? Object.values(error.constraints).join(', ')
            : 'Invalid value.',
        }));

        return new ValidationException(details);
      },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
}

void bootstrap();
