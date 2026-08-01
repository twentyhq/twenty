import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

// In case of exception in middleware run before the CORS middleware (eg: JSON Middleware that checks the request body),
// the CORS headers are missing in the response.
// This class add CORS headers to exception response to avoid misleading CORS error
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  // oxlint-disable-next-line typescript/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!response.header || response.headersSent) {
      return;
    }

    // TODO: Check if needed, remove otherwise.
    // Only for a response the CORS middleware never reached. Filling any of
    // these in on top of what it already set makes the two layers disagree:
    // overwriting a reflected origin with the wildcard, in particular, makes
    // the browser reject the response of a credentialed request that hit an
    // exception, so the client sees a CORS error instead of the API error.
    if (!response.getHeader('Access-Control-Allow-Origin')) {
      response.header('Access-Control-Allow-Origin', '*');
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

    response.status(status).json(exception.response ?? exception.message);
  }
}
