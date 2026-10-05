import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/utils/global-exception-handler.util';

// Exceptions thrown before the CORS middleware (e.g. JSON body parsing) would otherwise lack CORS headers
@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  // oxlint-disable-next-line typescript/no-explicit-any
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (!response.header || response.headersSent) {
      return;
    }

    // TODO: Check if needed, remove otherwise.
    // Only when the CORS middleware never ran: overwriting a reflected origin with * would make the browser reject a credentialed request
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

    handleException({
      exception,
      exceptionHandlerService: this.exceptionHandlerService,
      statusCode: status,
    });

    response.status(status).json(exception.response ?? exception.message);
  }
}
