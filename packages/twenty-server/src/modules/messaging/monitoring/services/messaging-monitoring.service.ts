import { Injectable } from '@nestjs/common';

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
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars unused-imports/no-unused-vars
  public async track({
    eventName,
    workspaceId,
    userId,
    connectedAccountId,
    messageChannelId,
    message,
  }: MessagingMonitoringTrackInput): Promise<void> {
    // TODO: replace once we have Prometheus
    // Variables available for future implementation: eventName, workspaceId, userId, connectedAccountId, messageChannelId, message
    /*
    await this.auditService
      .createContext({
        userId,
        workspaceId,
      })
      .insertWorkspaceEvent(MONITORING_EVENT, {
        eventName: `messaging.${eventName}`,
        connectedAccountId,
        messageChannelId,
        message,
      }); */
  }
}
