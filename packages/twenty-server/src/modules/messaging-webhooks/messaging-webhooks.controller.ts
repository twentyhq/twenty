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
import { MailgunInboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/mailgun/services/mailgun-inbound-webhook-driver.service';
import { MailgunOutboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/mailgun/services/mailgun-outbound-webhook-driver.service';
import { ResendWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/resend/services/resend-webhook-driver.service';
import { SesInboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/ses-inbound-webhook-driver.service';
import { SesOutboundWebhookDriverService } from 'src/modules/messaging-webhooks/drivers/aws-ses/services/ses-outbound-webhook-driver.service';
import { MessagingWebhookApiExceptionFilter } from 'src/modules/messaging-webhooks/filters/messaging-webhook-api-exception.filter';
import { MessagingWebhookExceptionCode } from 'src/modules/messaging-webhooks/messaging-webhook-exception-code.enum';
import { MessagingWebhookException } from 'src/modules/messaging-webhooks/messaging-webhook.exception';

@Controller()
@UseFilters(MessagingWebhookApiExceptionFilter)
export class MessagingWebhooksController {
  constructor(
    private readonly sesInboundWebhookDriverService: SesInboundWebhookDriverService,
    private readonly sesOutboundWebhookDriverService: SesOutboundWebhookDriverService,
    private readonly resendWebhookDriverService: ResendWebhookDriverService,
    private readonly mailgunInboundWebhookDriverService: MailgunInboundWebhookDriverService,
    private readonly mailgunOutboundWebhookDriverService: MailgunOutboundWebhookDriverService,
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

    await this.sesInboundWebhookDriverService.handle(request.rawBody);
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

    await this.sesOutboundWebhookDriverService.handle(request.rawBody);
  }

  @Post(`${ApiPath.Webhooks}/messaging/resend`)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleResendWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new MessagingWebhookException(
        'Missing Resend payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY,
      );
    }

    await this.resendWebhookDriverService.handle(request.rawBody, {
      svixId: this.getHeader(request, 'svix-id'),
      svixTimestamp: this.getHeader(request, 'svix-timestamp'),
      svixSignature: this.getHeader(request, 'svix-signature'),
    });
  }

  @Post(`${ApiPath.Webhooks}/messaging/mailgun/outbound`)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleMailgunOutboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.rawBody)) {
      throw new MessagingWebhookException(
        'Missing Mailgun payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY,
      );
    }

    await this.mailgunOutboundWebhookDriverService.handle(request.rawBody);
  }

  @Post(`${ApiPath.Webhooks}/messaging/mailgun/inbound`)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleMailgunInboundWebhook(
    @Req() request: RawBodyRequest<Request>,
  ): Promise<void> {
    if (!isDefined(request.body)) {
      throw new MessagingWebhookException(
        'Missing Mailgun payload',
        MessagingWebhookExceptionCode.MESSAGING_WEBHOOK_MISSING_REQUEST_BODY,
      );
    }

    await this.mailgunInboundWebhookDriverService.handle(
      request.body,
      this.getHeader(request, 'content-type'),
    );
  }

  private getHeader(request: Request, name: string): string | undefined {
    const value = request.headers[name];

    return Array.isArray(value) ? value[0] : value;
  }
}
