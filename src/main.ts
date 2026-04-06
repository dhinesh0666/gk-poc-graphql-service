/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { CustomLoggerService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule.forRoot());

  const logger = new CustomLoggerService();
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Health check REST endpoint prefix exclusion
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  await app.listen(PORT);
  logger.log(`Application running on: http://localhost:${PORT}`, 'Bootstrap');
  logger.log(`GraphQL Playground: http://localhost:${PORT}/graphql`, 'Bootstrap');
}

void bootstrap();
