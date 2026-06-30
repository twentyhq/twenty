import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { ConnectedAccountSyncWebhookException } from 'src/modules/connected-account-sync-webhooks/connected-account-sync-webhook.exception';
import { getConnectedAccountSyncWebhookExceptionStatusCode } from 'src/modules/connected-account-sync-webhooks/utils/get-connected-account-sync-webhook-exception-status-code.util';

@Catch(ConnectedAccountSyncWebhookException)
export class ConnectedAccountSyncWebhookApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: ConnectedAccountSyncWebhookException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getConnectedAccountSyncWebhookExceptionStatusCode(exception),
    );
  }
}
