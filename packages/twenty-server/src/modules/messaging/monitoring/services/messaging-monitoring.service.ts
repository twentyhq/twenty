import { Injectable } from '@nestjs/common';

import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';

type MessagingMonitoringTrackInput = {
  eventName: string;
  workspaceId?: string;
  userId?: string;
  connectedAccountId?: string;
  messageChannelId?: string;
  message?: string;
};

@Injectable()
export class MessagingMonitoringService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  public async track({
    eventName,
    workspaceId,
    userId,
    connectedAccountId,
    messageChannelId,
    message,
  }: MessagingMonitoringTrackInput): Promise<void> {
    const _eventName = eventName;
    const _workspaceId = workspaceId;
    const _userId = userId;
    const _connectedAccountId = connectedAccountId;
    const _messageChannelId = messageChannelId;
    const _message = message;

    // TODO: replace once we have Prometheus
    /*
    await this.analyticsService
      .createAnalyticsContext({
        userId,
        workspaceId,
      })
      .track(MONITORING_EVENT, {
        eventName: `messaging.${eventName}`,
        connectedAccountId,
        messageChannelId,
        message,
      }); */
  }
}
