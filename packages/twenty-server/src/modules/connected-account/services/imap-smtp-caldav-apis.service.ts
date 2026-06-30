import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type PlaintextImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

@Injectable()
export class ImapSmtpCalDavAPIService {
  private readonly logger = new Logger(ImapSmtpCalDavAPIService.name);

  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly createCalendarChannelService: CreateCalendarChannelService,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async upsertConnectedAccount(input: {
    handle: string;
    userWorkspaceId: string;
    workspaceId: string;
    // Caller (resolver) has already validated the input through
    // `ImapSmtpCaldavService.validateAndTestConnectionParameters`, which
    // produces fully plaintext passwords ready for re-encryption.
    connectionParameters: PlaintextImapSmtpCaldavParams;
    existingAccount?: ConnectedAccountEntity | null;
  }): Promise<string> {
    const { handle, workspaceId, userWorkspaceId } = input;

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: userWorkspaceId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      throw new NotFoundError(
        `UserWorkspace with id ${userWorkspaceId} not found in workspace ${workspaceId}`,
      );
    }

    const existingAccount =
      input.existingAccount ??
      (await this.connectedAccountRepository.findOne({
        where: { handle, userWorkspaceId, workspaceId },
      }));

    const newOrExistingAccountId = existingAccount?.id ?? v4();

    const existingMessageChannel = existingAccount
      ? await this.messageChannelRepository.findOne({
          where: { connectedAccountId: existingAccount.id, workspaceId },
        })
      : null;

    const existingCalendarChannel = existingAccount
      ? await this.calendarChannelRepository.findOne({
          where: { connectedAccountId: existingAccount.id, workspaceId },
        })
      : null;

    const shouldCreateMessageChannel =
      !isDefined(existingMessageChannel) &&
      Boolean(input.connectionParameters.IMAP);

    const shouldCreateCalendarChannel =
      !isDefined(existingCalendarChannel) &&
      Boolean(input.connectionParameters.CALDAV);

    await this.connectedAccountRepository.manager.transaction(
      async (transactionManager: EntityManager) => {
        const encryptedConnectionParameters =
          this.connectedAccountTokenEncryptionService.encryptConnectionParameters(
            {
              connectionParameters: input.connectionParameters,
              workspaceId,
            },
          );

        await transactionManager.getRepository(ConnectedAccountEntity).save({
          id: newOrExistingAccountId,
          handle,
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
          connectionParameters: encryptedConnectionParameters,
          userWorkspaceId,
          workspaceId,
          authFailedAt: null,
        });

        if (shouldCreateMessageChannel) {
          await this.createMessageChannelService.createMessageChannel({
            workspaceId,
            connectedAccountId: newOrExistingAccountId,
            handle,
            transactionManager,
          });
        }

        if (shouldCreateCalendarChannel) {
          await this.createCalendarChannelService.createCalendarChannel({
            workspaceId,
            connectedAccountId: newOrExistingAccountId,
            handle,
            transactionManager,
          });
        }
      },
    );

    if (isDefined(existingAccount)) {
      await this.accountsToReconnectService.removeAccountToReconnect(
        userWorkspace.userId,
        workspaceId,
        newOrExistingAccountId,
      );
    }

    if (shouldCreateMessageChannel) {
      const newMessageChannel = await this.messageChannelRepository.findOne({
        where: {
          connectedAccountId: newOrExistingAccountId,
          workspaceId,
        },
        relations: ['connectedAccount', 'messageFolders'],
      });

      if (isDefined(newMessageChannel)) {
        try {
          await this.syncMessageFoldersService.syncMessageFolders({
            messageChannel: newMessageChannel,
            workspaceId,
          });
        } catch (error) {
          this.logger.warn(
            `Initial folder sync failed for account ${newOrExistingAccountId}, will retry on next scheduled sync: ${error?.message}`,
          );
        }
      }
    }

    if (
      isDefined(existingMessageChannel) &&
      isDefined(input.connectionParameters.IMAP) &&
      existingMessageChannel.syncStage !==
        MessageChannelSyncStage.PENDING_CONFIGURATION
    ) {
      await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
        [existingMessageChannel.id],
        workspaceId,
      );

      await this.messageQueueService.add<MessagingMessageListFetchJobData>(
        MessagingMessageListFetchJob.name,
        { workspaceId, messageChannelId: existingMessageChannel.id },
      );
    }

    if (
      isDefined(existingCalendarChannel) &&
      isDefined(input.connectionParameters.CALDAV) &&
      existingCalendarChannel.syncStage !==
        CalendarChannelSyncStage.PENDING_CONFIGURATION
    ) {
      await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
        [existingCalendarChannel.id],
        workspaceId,
      );

      await this.calendarQueueService.add<CalendarEventListFetchJobData>(
        CalendarEventListFetchJob.name,
        { workspaceId, calendarChannelId: existingCalendarChannel.id },
      );
    }

    return newOrExistingAccountId;
  }
}
