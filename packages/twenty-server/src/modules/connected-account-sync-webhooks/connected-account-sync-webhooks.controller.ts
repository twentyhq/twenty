import {
  Body,
  Controller,
  Headers,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { WEBHOOK_SUBSCRIPTION_ROUTE_PATHS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-route-paths.constant';
import { ConnectedAccountSyncWebhookApiExceptionFilter } from 'src/modules/connected-account-sync-webhooks/filters/connected-account-sync-webhook-api-exception.filter';
import { GoogleCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/google-calendar-notification.handler';
import { GoogleMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/google-messaging-notification.handler';
import { MicrosoftCalendarNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/microsoft-calendar-notification.handler';
import { MicrosoftMessagingNotificationHandler } from 'src/modules/connected-account-sync-webhooks/handlers/microsoft-messaging-notification.handler';
import { type GooglePubSubPushMessage } from 'src/modules/connected-account-sync-webhooks/types/google-pubsub-push.type';
import { type MicrosoftGraphNotificationPayload } from 'src/modules/connected-account-sync-webhooks/types/microsoft-graph-notification.type';

@Controller()
@UseFilters(ConnectedAccountSyncWebhookApiExceptionFilter)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ConnectedAccountSyncWebhooksController {
  constructor(
    private readonly googleMessagingNotificationHandler: GoogleMessagingNotificationHandler,
    private readonly googleCalendarNotificationHandler: GoogleCalendarNotificationHandler,
    private readonly microsoftMessagingNotificationHandler: MicrosoftMessagingNotificationHandler,
    private readonly microsoftCalendarNotificationHandler: MicrosoftCalendarNotificationHandler,
  ) {}

  @Post(WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.GOOGLE_MESSAGING)
  async handleGoogleMessaging(
    @Body() body: GooglePubSubPushMessage,
    @Headers('authorization') authorizationHeader: string | undefined,
  ): Promise<void> {
    await this.googleMessagingNotificationHandler.handle({
      body,
      authorizationHeader,
    });
  }

  @Post(WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.GOOGLE_CALENDAR)
  async handleGoogleCalendar(
    @Headers('x-goog-channel-id') channelId: string | undefined,
    @Headers('x-goog-resource-state') resourceState: string | undefined,
    @Headers('x-goog-channel-token') channelToken: string | undefined,
  ): Promise<void> {
    await this.googleCalendarNotificationHandler.handle({
      channelId,
      resourceState,
      channelToken,
    });
  }

  @Post(WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.MICROSOFT_MESSAGING)
  async handleMicrosoftMessaging(
    @Body() body: MicrosoftGraphNotificationPayload,
    @Query('validationToken') validationToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    if (isDefined(validationToken)) {
      response.type('text/plain');

      return validationToken;
    }

    await this.microsoftMessagingNotificationHandler.handle(body.value ?? []);

    return '';
  }

  @Post(WEBHOOK_SUBSCRIPTION_ROUTE_PATHS.MICROSOFT_CALENDAR)
  async handleMicrosoftCalendar(
    @Body() body: MicrosoftGraphNotificationPayload,
    @Query('validationToken') validationToken: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    if (isDefined(validationToken)) {
      response.type('text/plain');

      return validationToken;
    }

    await this.microsoftCalendarNotificationHandler.handle(body.value ?? []);

    return '';
  }
}
