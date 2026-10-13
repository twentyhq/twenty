import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { type Response } from 'express';

import { buildRecipientErrorPage } from 'src/engine/core-modules/emailing-domain/utils/build-recipient-error-page.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/utils/global-exception-handler.util';

@Catch()
export class RecipientPageExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: Error, host: ArgumentsHost) {
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 500;

    handleException({
      exception,
      exceptionHandlerService: this.exceptionHandlerService,
      statusCode,
    });

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      })
      .send(buildRecipientErrorPage(statusCode));
  }
}
