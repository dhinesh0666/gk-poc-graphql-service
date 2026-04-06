/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { Injectable, LoggerService as NestLoggerService, ConsoleLogger } from '@nestjs/common';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

@Injectable()
export class CustomLoggerService extends ConsoleLogger implements NestLoggerService {
  private readonly configuredLogLevel: LogLevel;
  private readonly logLevelHierarchy: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor() {
    super('Application');
    const envLogLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
    this.configuredLogLevel = this.isValidLogLevel(envLogLevel) ? envLogLevel : 'info';
  }

  private readonly sensitiveFields = ['password', 'token', 'access_token', 'refresh_token', 'authorization', 'password_hash', 'secret'];

  private isValidLogLevel(level: string): level is LogLevel {
    return ['error', 'warn', 'info', 'debug'].includes(level);
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    return this.logLevelHierarchy[messageLevel] <= this.logLevelHierarchy[this.configuredLogLevel];
  }

  private sanitizeData(data: unknown, seen = new WeakSet()): unknown {
    if (!data) return data;

    if (typeof data === 'string') {
      if (data.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
        return '[TOKEN_REDACTED]';
      }
      return data;
    }

    if (typeof data !== 'object') return data;

    if (seen.has(data as object)) return '[Circular]';
    seen.add(data as object);

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item, seen));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (this.sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitizeData(value, seen);
      }
    }
    return sanitized;
  }

  setContext(context: string): void {
    this.context = context;
  }

  logRequest(method: string, url: string, body: unknown, headers: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const sanitizedBody = this.sanitizeData(body);
    const sanitizedHeaders = this.sanitizeData(headers);
    super.log(`→ ${method} ${url} | Body: ${JSON.stringify(sanitizedBody)} | Headers: ${JSON.stringify(sanitizedHeaders)}`, 'HTTP');
  }

  logResponse(method: string, url: string, statusCode: number, responseTime: number, data: unknown): void {
    if (!this.shouldLog('info')) return;
    const sanitizedData = this.sanitizeData(data);
    super.log(`← ${method} ${url} ${statusCode} (${responseTime}ms) | Response: ${JSON.stringify(sanitizedData)}`, 'HTTP');
  }

  logGraphQL(operation: string, variables: unknown, responseTime: number): void {
    if (!this.shouldLog('info')) return;
    const sanitizedVars = this.sanitizeData(variables);
    super.log(`[GQL] ${operation} (${responseTime}ms) | Variables: ${JSON.stringify(sanitizedVars)}`, 'GraphQL');
  }

  error(message: string, stack?: string, context?: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    const sanitizedMeta = meta ? this.sanitizeData(meta) : undefined;
    super.error(message, stack, context || this.context);
    if (sanitizedMeta) {
      super.error(`Meta: ${JSON.stringify(sanitizedMeta)}`, undefined, context || this.context);
    }
  }

  warn(message: string, context?: string): void {
    if (!this.shouldLog('warn')) return;
    super.warn(message, context || this.context);
  }

  log(message: string, context?: string): void {
    if (!this.shouldLog('info')) return;
    super.log(message, context || this.context);
  }

  debug(message: string, context?: string): void {
    if (!this.shouldLog('debug')) return;
    super.debug(message, context || this.context);
  }
}
