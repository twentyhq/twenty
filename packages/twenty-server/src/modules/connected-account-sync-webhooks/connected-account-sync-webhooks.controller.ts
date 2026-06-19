import {
  Body,
  Controller,
  Header,
  Headers,
  HttpCode,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ConnectedAccountSyncWebhookApiExceptionFilter } from 'src/modules/connected-account-sync-webhooks/filters/connected-account-sync-webhook-api-exception.filter';
import { GooglePushAuthGuard } from 'src/modules/connected-account-sync-webhooks/guards/google-push-auth.guard';
import { GoogleWebhookService } from 'src/modules/connected-account-sync-webhooks/services/google-webhook.service';
import { MicrosoftWebhookService } from 'src/modules/connected-account-sync-webhooks/services/microsoft-webhook.service';
import { type GooglePubSubPushMessage } from 'src/modules/connected-account-sync-webhooks/types/google-pubsub-push.type';
import { type MicrosoftGraphNotificationPayload } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';

@Controller()
@UseFilters(ConnectedAccountSyncWebhookApiExceptionFilter)
export class ConnectedAccountSyncWebhooksController {
  constructor(
    private readonly googleWebhookService: GoogleWebhookService,
    private readonly microsoftWebhookService: MicrosoftWebhookService,
  ) {}

  @Post(['webhooks/google/messaging'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard, GooglePushAuthGuard)
  @HttpCode(200)
  async handleGoogleMessagingWebhook(
    @Body() notification: GooglePubSubPushMessage,
  ): Promise<void> {
    await this.googleWebhookService.handleEmailNotification(notification);
  }

  @Post(['webhooks/google/calendar'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  async handleGoogleCalendarWebhook(
    @Headers('x-goog-channel-id') channelId?: string,
    @Headers('x-goog-resource-state') resourceState?: string,
    @Headers('x-goog-channel-token') channelToken?: string,
  ): Promise<void> {
    await this.googleWebhookService.handleCalendarNotification({
      channelId,
      resourceState,
      channelToken,
    });
  }

  @Post(['webhooks/microsoft/messaging'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async handleMicrosoftMessagingWebhook(
    @Body() payload: MicrosoftGraphNotificationPayload,
    @Query('validationToken') validationToken?: string,
  ): Promise<string> {
    if (isNonEmptyString(validationToken)) {
      return validationToken;
    }

    await this.microsoftWebhookService.handleEmailNotification(
      payload.value ?? [],
    );

    return '';
  }

  @Post(['webhooks/microsoft/calendar'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async handleMicrosoftCalendarWebhook(
    @Body() payload: MicrosoftGraphNotificationPayload,
    @Query('validationToken') validationToken?: string,
  ): Promise<string> {
    if (isNonEmptyString(validationToken)) {
      return validationToken;
    }

    await this.microsoftWebhookService.handleCalendarNotification(
      payload.value ?? [],
    );

    return '';
  }
}
