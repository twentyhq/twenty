import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { Request, Response } from 'express';

// In case of exception in middleware run before the CORS middleware (eg: JSON Middleware that checks the request body),
// the CORS headers are missing in the response.
// This class add CORS headers to exception response to avoid misleading CORS error
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  private readonly allowedOriginPattern: RegExp | null;

  constructor() {
    const allowedOriginRegex = process.env.ALLOWED_REQUEST_ORIGIN_REGEX;
    this.allowedOriginPattern = allowedOriginRegex
      ? new RegExp(allowedOriginRegex)
      : null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (!response.header || response.headersSent) {
      return;
    }

    const origin = request.headers.origin as string | undefined;
    
    if (this.allowedOriginPattern && origin) {
      if (this.allowedOriginPattern.test(origin)) {
        response.header('Access-Control-Allow-Origin', origin);
        response.header('Access-Control-Allow-Credentials', 'true');
      }
    } else if (!this.allowedOriginPattern) {
      response.header('Access-Control-Allow-Origin', '*');
    }
    
    response.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    response.status(status).json(exception.response);
  }
}
