import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

// In case of exception in middleware run before the CORS middleware (eg: JSON Middleware that checks the request body),
// the CORS headers are missing in the response.
// This class mirrors the request origin to avoid misleading CORS errors without granting wildcard access
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    if (!response.header || response.headersSent) {
      return;
    }

    const origin = request?.headers?.origin;

    if (origin) {
      response.header('Access-Control-Allow-Origin', origin);
      response.header('Vary', 'Origin');
      response.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE',
      );
      response.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
    }

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    response.status(status).json(exception.response);
  }
}
