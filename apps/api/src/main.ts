import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationException } from './common/exceptions/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');

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
