import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { CreateMessageFolderService } from 'src/engine/core-modules/auth/services/create-message-folder.service';
import { EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarEventListFetchJob,
  CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingMessageListFetchJob,
  MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly createMessageFolderService: CreateMessageFolderService,
  ) {}

  async setupCompleteAccount(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    connectionParameters: EmailAccountConnectionParameters;
    connectedAccountId?: string;
  }) {
    const { handle, workspaceId, workspaceMemberId, connectedAccountId } =
      input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const calendarChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
        workspaceId,
        'calendarChannel',
      );

    const existingAccount = connectedAccountId
      ? await connectedAccountRepository.findOne({
          where: { id: connectedAccountId },
        })
      : await connectedAccountRepository.findOne({
          where: { handle, accountOwnerId: workspaceMemberId },
        });

    const accountId = existingAccount?.id ?? connectedAccountId ?? v4();

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    let createdMessageChannel: MessageChannelWorkspaceEntity | null = null;
    let createdCalendarChannel: CalendarChannelWorkspaceEntity | null = null;

    await workspaceDataSource.transaction(
      async (manager: WorkspaceEntityManager) => {
        await this.upsertConnectedAccount(
          input,
          accountId,
          connectedAccountRepository,
        );

        createdMessageChannel = await this.setupMessageChannels(
          input,
          accountId,
          messageChannelRepository,
          manager,
        );

        createdCalendarChannel = await this.setupCalendarChannels(
          input,
          accountId,
          calendarChannelRepository,
        );
      },
    );

    await this.enqueueSyncJobs(
      input,
      workspaceId,
      createdMessageChannel,
      createdCalendarChannel,
    );
  }

  private async upsertConnectedAccount(
    input: {
      handle: string;
      workspaceMemberId: string;
      workspaceId: string;
      connectionParameters: EmailAccountConnectionParameters;
    },
    accountId: string,
    connectedAccountRepository: WorkspaceRepository<ConnectedAccountWorkspaceEntity>,
  ) {
    const accountData = {
      id: accountId,
      handle: input.handle,
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      connectionParameters: input.connectionParameters,
      accountOwnerId: input.workspaceMemberId,
    };

    await connectedAccountRepository.save(accountData, {});
  }

  private async setupMessageChannels(
    input: {
      handle: string;
      workspaceId: string;
      connectionParameters: EmailAccountConnectionParameters;
    },
    accountId: string,
    messageChannelRepository: WorkspaceRepository<MessageChannelWorkspaceEntity>,
    manager: WorkspaceEntityManager,
  ): Promise<MessageChannelWorkspaceEntity | null> {
    const existingChannels = await messageChannelRepository.find({
      where: { connectedAccountId: accountId },
    });

    if (existingChannels.length > 0) {
      await messageChannelRepository.delete({
        connectedAccountId: accountId,
      });
    }

    const shouldEnableSync = Boolean(input.connectionParameters.IMAP);

    const newMessageChannel = await messageChannelRepository.save(
      {
        id: v4(),
        connectedAccountId: accountId,
        type: MessageChannelType.EMAIL,
        handle: input.handle,
        isSyncEnabled: shouldEnableSync,
        syncStatus: shouldEnableSync
          ? MessageChannelSyncStatus.ONGOING
          : MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: shouldEnableSync
          ? MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING
          : undefined,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      {},
    );

    await this.createMessageFolderService.createMessageFolders({
      workspaceId: input.workspaceId,
      messageChannelId: newMessageChannel.id,
      manager,
    });

    return shouldEnableSync ? newMessageChannel : null;
  }

  private async setupCalendarChannels(
    input: {
      handle: string;
      workspaceId: string;
      connectionParameters: EmailAccountConnectionParameters;
    },
    accountId: string,
    calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
  ): Promise<CalendarChannelWorkspaceEntity | null> {
    const existingChannels = await calendarChannelRepository.find({
      where: { connectedAccountId: accountId },
    });

    if (existingChannels.length > 0) {
      await calendarChannelRepository.delete({
        connectedAccountId: accountId,
      });
    }

    const shouldEnableSync = Boolean(input.connectionParameters.CALDAV);

    if (shouldEnableSync) {
      const newCalendarChannel = await calendarChannelRepository.save(
        {
          id: v4(),
          connectedAccountId: accountId,
          handle: input.handle,
          isSyncEnabled: shouldEnableSync,
          syncStatus: CalendarChannelSyncStatus.ONGOING,
          syncStage:
            CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
          syncCursor: '',
          syncStageStartedAt: null,
        },
        {},
      );

      return newCalendarChannel;
    }

    return null;
  }

  private async enqueueSyncJobs(
    input: {
      connectionParameters: EmailAccountConnectionParameters;
    },
    workspaceId: string,
    messageChannel: MessageChannelWorkspaceEntity | null,
    calendarChannel: CalendarChannelWorkspaceEntity | null,
  ) {
    if (input.connectionParameters.IMAP && messageChannel) {
      await this.messageQueueService.add<MessagingMessageListFetchJobData>(
        MessagingMessageListFetchJob.name,
        {
          workspaceId,
          messageChannelId: messageChannel.id,
        },
      );
    }

    if (input.connectionParameters.CALDAV && calendarChannel) {
      await this.calendarQueueService.add<CalendarEventListFetchJobData>(
        CalendarEventListFetchJob.name,
        {
          workspaceId,
          calendarChannelId: calendarChannel.id,
        },
      );
    }
  }
}
