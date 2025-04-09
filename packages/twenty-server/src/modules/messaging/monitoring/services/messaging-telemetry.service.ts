import { Injectable } from '@nestjs/common';

import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';

type MessagingTelemetryTrackInput = {
  eventName: string;
  workspaceId?: string;
  userId?: string;
  connectedAccountId?: string;
  messageChannelId?: string;
  message?: string;
};

@Injectable()
export class MessagingTelemetryService {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  public async track({
    eventName,
    workspaceId,
    userId,
    connectedAccountId,
    messageChannelId,
    message,
  }: MessagingTelemetryTrackInput): Promise<void> {
    await this.analyticsService
      .createAnalyticsContext({
        userId,
        workspaceId,
      })
      .sendUnknownEvent({
        action: 'monitoring',
        payload: {
          eventName: `messaging.${eventName}`,
          workspaceId,
          userId,
          connectedAccountId,
          messageChannelId,
          message,
        },
      });
  }
}
