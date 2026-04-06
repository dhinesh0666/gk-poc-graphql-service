/**
 * GK POC GraphQL Service
 * (c) 2025
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CustomLoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService();

  catch(exception: unknown, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();

    // If this is a GraphQL context, let NestJS/Apollo handle it by re-throwing as GraphQLError
    if (info) {
      this.handleGraphQLException(exception);
      return;
    }

    // Otherwise handle as HTTP (health endpoint etc.)
    this.handleHttpException(exception, host);
  }

  private handleGraphQLException(exception: unknown): never {
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        code = (responseObj.error as string) || this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error('Unhandled GraphQL exception', exception.stack, 'AllExceptionsFilter');
    }

    throw new GraphQLError(message, {
      extensions: { code, statusCode: status },
    });
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{ status: (code: number) => { json: (body: unknown) => void } }>();
    const request = ctx.getRequest<{ method: string; url: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || message;
      }
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled HTTP exception', exception.stack, 'AllExceptionsFilter', {
        url: request.url,
        method: request.method,
      });
    }

    response.status(status).json({
      error: true,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[status] || 'INTERNAL_SERVER_ERROR';
  }
}
