import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type StartChannelSyncInput = {
  connectedAccountId: string;
  workspaceId: string;
};

@Injectable()
export class ChannelSyncService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  async startChannelSync(input: StartChannelSyncInput): Promise<void> {
    const { connectedAccountId, workspaceId } = input;

    await this.startMessageChannelSync(connectedAccountId, workspaceId);
    await this.startCalendarChannelSync(connectedAccountId, workspaceId);
  }

  private async startMessageChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: {
        connectedAccountId,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
      },
    });

    for (const messageChannel of messageChannels) {
      await messageChannelRepository.update(messageChannel.id, {
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
      });
    }
  }

  private async startCalendarChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const calendarChannels = await calendarChannelRepository.find({
      where: {
        connectedAccountId,
        syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
      },
    });

    for (const calendarChannel of calendarChannels) {
      await calendarChannelRepository.update(calendarChannel.id, {
        syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
        syncStatus: CalendarChannelSyncStatus.ONGOING,
      });
    }
  }
}
