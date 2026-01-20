import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response, type Request } from 'express';

// In case of exception in middleware run before the CORS middleware (eg: JSON Middleware that checks the request body),
// the CORS headers are missing in the response.
// This class add CORS headers to exception response to avoid misleading CORS error
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Log the error for debugging
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    console.error(`[UnhandledExceptionFilter] ${request.method} ${request.url}`);
    console.error(`[UnhandledExceptionFilter] Status: ${status}`);
    console.error(`[UnhandledExceptionFilter] Error: ${errorMessage}`);
    if (errorStack) {
      console.error(`[UnhandledExceptionFilter] Stack: ${errorStack}`);
    }

    if (!response.header || response.headersSent) {
      return;
    }

    // TODO: Check if needed, remove otherwise.
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );

    response.status(status).json(exception.response);
  }
}
