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

  public async track({
    eventName: _eventName,
    workspaceId: _workspaceId,
    userId: _userId,
    connectedAccountId: _connectedAccountId,
    messageChannelId: _messageChannelId,
    message: _message,
  }: MessagingMonitoringTrackInput): Promise<void> {
    // TODO: replace once we have Prometheus
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
