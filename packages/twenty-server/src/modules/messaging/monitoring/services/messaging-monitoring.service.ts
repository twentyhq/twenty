import { Injectable } from '@nestjs/common';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';

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
  constructor(private readonly auditService: AuditService) {}

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
