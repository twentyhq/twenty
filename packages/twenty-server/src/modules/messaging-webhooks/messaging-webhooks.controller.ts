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
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SesInboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/ses-inbound-webhook-adapter.service';
import { SesOutboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/ses-outbound-webhook-adapter.service';
import { MessagingWebhookApiExceptionFilter } from 'src/modules/messaging-webhooks/filters/messaging-webhook-api-exception.filter';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

@Controller()
@UseFilters(MessagingWebhookApiExceptionFilter)
export class MessagingWebhooksController {
  constructor(
    private readonly sesInboundWebhookAdapterService: SesInboundWebhookAdapterService,
    private readonly sesOutboundWebhookAdapterService: SesOutboundWebhookAdapterService,
  ) {}

  @Post(`${ApiPath.Webhooks}/messaging/ses/inbound`)
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

    await this.sesInboundWebhookAdapterService.handle(request.rawBody);
  }

  @Post(`${ApiPath.Webhooks}/messaging/ses/outbound`)
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

    await this.sesOutboundWebhookAdapterService.handle(request.rawBody);
  }
}
