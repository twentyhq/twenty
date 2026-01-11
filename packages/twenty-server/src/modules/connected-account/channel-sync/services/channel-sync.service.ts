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
  type ImportProgressResult,
  MessagingFolderRetroactiveImportService,
} from 'src/modules/messaging/message-import-manager/services/messaging-folder-retroactive-import.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

export type StartChannelSyncInput = {
  connectedAccountId: string;
  workspaceId: string;
};

export type TriggerMessageFolderSyncInput = {
  messageFolderId: string;
  workspaceId: string;
};

export type GetImportProgressInput = {
  messageChannelId: string;
  workspaceId: string;
};

export type GetSyncStatisticsInput = {
  messageChannelId: string;
  workspaceId: string;
};

export type SyncStatisticsResult = {
  syncStatus: string;
  syncStage: string;
  importedMessages: number;
  pendingMessages: number;
  contactsCreated: number;
  companiesCreated: number;
  lastSyncedAt: string | null;
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

        // Mark channel as importing immediately so UI updates
        await this.messageChannelSyncStatusService.markAsMessagesImportPending(
          [messageFolder.messageChannelId],
          workspaceId,
          true, // preserve syncStageStartedAt
        );

        console.log(
          `\n[triggerMessageFolderSync] Adding job to queue for folder ${messageFolder.externalId}`,
        );
        console.log(`  workspaceId: ${workspaceId}`);
        console.log(`  messageChannelId: ${messageFolder.messageChannelId}`);
        console.log(`  messageFolderId: ${messageFolder.id}`);

        await this.messageQueueService.add<MessagingFolderRetroactiveImportJobData>(
          MessagingFolderRetroactiveImportJob.name,
          {
            workspaceId,
            messageChannelId: messageFolder.messageChannelId,
            messageFolderId: messageFolder.id,
            folderExternalId: messageFolder.externalId,
          },
        );

        console.log(`[triggerMessageFolderSync] Job added to queue successfully\n`);
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

  async getImportProgress(
    input: GetImportProgressInput,
  ): Promise<ImportProgressResult> {
    const { messageChannelId, workspaceId } = input;

    return await this.messagingFolderRetroactiveImportService.getImportProgress(
      workspaceId,
      messageChannelId,
    );
  }

  async getSyncStatistics(
    input: GetSyncStatisticsInput,
  ): Promise<SyncStatisticsResult> {
    const { messageChannelId, workspaceId } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        // Get message channel info
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageChannelId },
        });

        if (!messageChannel) {
          throw new Error(`Message channel ${messageChannelId} not found`);
        }

        // Get imported messages count using repository
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const importedMessages =
          await messageChannelMessageAssociationRepository.count({
            where: { messageChannelId },
          });

        console.log(
          `[getSyncStatistics] workspaceId: ${workspaceId}, messageChannelId: ${messageChannelId}, importedMessages: ${importedMessages}`,
        );

        // Get pending messages from Redis cache
        const pendingResult =
          await this.messagingFolderRetroactiveImportService.getImportProgress(
            workspaceId,
            messageChannelId,
          );
        const pendingMessages = pendingResult.remainingMessages;

        // Count contacts and companies created from email
        // Use the entity classes with shouldBypassPermissionChecks to query createdBy.source
        let contactsCreated = 0;
        let companiesCreated = 0;

        try {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              PersonWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          // Query using the composite field path
          contactsCreated = await personRepository
            .createQueryBuilder('person')
            .where('"createdBySource" = :source', { source: 'EMAIL' })
            .getCount();

          const companyRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              CompanyWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          companiesCreated = await companyRepository
            .createQueryBuilder('company')
            .where('"createdBySource" = :source', { source: 'EMAIL' })
            .getCount();
        } catch {
          // If query fails, default to 0
          contactsCreated = 0;
          companiesCreated = 0;
        }

        return {
          syncStatus: messageChannel.syncStatus || 'UNKNOWN',
          syncStage: messageChannel.syncStage || 'UNKNOWN',
          importedMessages,
          pendingMessages,
          contactsCreated,
          companiesCreated,
          lastSyncedAt: messageChannel.syncedAt || null,
        };
      },
    );
  }
}
