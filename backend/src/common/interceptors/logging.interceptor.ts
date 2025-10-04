import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`,
    );

    // log request body (except passwords)
    if (Object.keys(body || {}).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params || {}).length > 0) {
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Response: ${method} ${url} - ${response.statusCode} - ${responseTime}ms`,
          );

          // log response only in debug mode
          if (data && typeof data === 'object') {
            this.logger.debug(
              `Response Data: ${JSON.stringify(this.sanitizeBody(data))}`,
            );
          }
        },
        error: (error: HttpError) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Error Response: ${method} ${url} - ${error.status || 500} - ${responseTime}ms`,
            error.stack,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveFields = [
      'password',
      'password_hash',
      'token',
      'access_token',
      'secret',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    });

    return sanitized;
  }
}
