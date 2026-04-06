/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { Module, Global } from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

@Global()
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class LoggerModule {}
