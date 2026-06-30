import {
  Controller,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type Request } from 'express';

import { MessagingWebhookApiExceptionFilter } from 'src/modules/messaging-webhooks/filters/messaging-webhook-api-exception.filter';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';
import { SesInboundWebhookRouterService } from 'src/modules/messaging-webhooks/services/ses-inbound-webhook-router.service';
import { SesOutboundWebhookRouterService } from 'src/modules/messaging-webhooks/services/ses-outbound-webhook-router.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { isDefined } from 'twenty-shared/utils';

@Controller()
@UseFilters(MessagingWebhookApiExceptionFilter)
export class MessagingWebhooksController {
  constructor(
    private readonly sesInboundWebhookRouterService: SesInboundWebhookRouterService,
    private readonly sesOutboundWebhookRouterService: SesOutboundWebhookRouterService,
  ) {}

  @Post(['webhooks/messaging/ses/inbound'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleSesInboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new MessagingWebhookException(
        'Missing SNS payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY,
      );
    }

    await this.sesInboundWebhookRouterService.route(request.rawBody);
  }

  @Post(['webhooks/messaging/ses/outbound'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleSesOutboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new MessagingWebhookException(
        'Missing SNS payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY,
      );
    }

    await this.sesOutboundWebhookRouterService.route(request.rawBody);
  }
}
