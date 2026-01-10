import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessagingFolderRetroactiveImportJob,
  type MessagingFolderRetroactiveImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-folder-retroactive-import.job';
import {
  type DryRunImportResult,
  MessagingFolderRetroactiveImportService,
} from 'src/modules/messaging/message-import-manager/services/messaging-folder-retroactive-import.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

export type StartChannelSyncInput = {
  connectedAccountId: string;
  workspaceId: string;
};

export type TriggerMessageFolderSyncInput = {
  messageFolderId: string;
  workspaceId: string;
};

@Injectable()
export class ChannelSyncService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly messagingFolderRetroactiveImportService: MessagingFolderRetroactiveImportService,
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
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
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
          await this.messageChannelSyncStatusService.markAsMessagesListFetchScheduled(
            [messageChannel.id],
            workspaceId,
          );

          await this.messageQueueService.add<MessagingMessageListFetchJobData>(
            MessagingMessageListFetchJob.name,
            {
              workspaceId,
              messageChannelId: messageChannel.id,
            },
          );
        }
      },
    );
  }

  private async startCalendarChannelSync(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
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
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
            syncStatus: CalendarChannelSyncStatus.ONGOING,
          });

          await this.calendarQueueService.add<CalendarEventListFetchJobData>(
            CalendarEventListFetchJob.name,
            {
              workspaceId,
              calendarChannelId: calendarChannel.id,
            },
          );
        }
      },
    );
  }

  async triggerMessageFolderSync(
    input: TriggerMessageFolderSyncInput,
  ): Promise<void> {
    const { messageFolderId, workspaceId } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspaceId,
            'messageFolder',
          );

        const messageFolder = await messageFolderRepository.findOne({
          where: { id: messageFolderId },
        });

        if (!messageFolder) {
          throw new Error(`Message folder ${messageFolderId} not found`);
        }

        await this.messageQueueService.add<MessagingFolderRetroactiveImportJobData>(
          MessagingFolderRetroactiveImportJob.name,
          {
            workspaceId,
            messageChannelId: messageFolder.messageChannelId,
            messageFolderId: messageFolder.id,
            folderExternalId: messageFolder.externalId,
          },
        );
      },
    );
  }

  async dryRunMessageFolderSync(
    input: TriggerMessageFolderSyncInput,
  ): Promise<DryRunImportResult> {
    const { messageFolderId, workspaceId } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageFolderRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
            workspaceId,
            'messageFolder',
          );

        const messageFolder = await messageFolderRepository.findOne({
          where: { id: messageFolderId },
        });

        if (!messageFolder) {
          throw new Error(`Message folder ${messageFolderId} not found`);
        }

        return await this.messagingFolderRetroactiveImportService.dryRunImport({
          workspaceId,
          messageChannelId: messageFolder.messageChannelId,
          messageFolderId: messageFolder.id,
          folderExternalId: messageFolder.externalId,
        });
      },
    );
  }
}
