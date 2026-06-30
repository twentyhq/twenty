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
    // TODO: emit monitoring once Prometheus lands
  }
}
