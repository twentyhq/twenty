import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { EntityManager, Repository } from 'typeorm';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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
  ) {}

  async getImapSmtpCaldavConnectedAccount(
    workspaceId: string,
    id: string,
  ): Promise<ConnectedAccountEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const connectedAccount = await this.connectedAccountRepository.findOne({
          where: {
            id,
            provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
            workspaceId,
          },
        });

        return connectedAccount;
      },
      authContext,
    );
  }

  async processAccount(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    connectionParameters: EmailAccountConnectionParameters;
    connectedAccountId?: string;
  }): Promise<string> {
    const { handle, workspaceId, workspaceMemberId, connectedAccountId } =
      input;

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceContext = getWorkspaceContext();
        const rolePermissionConfig = resolveRolePermissionConfig({
          authContext: workspaceContext.authContext,
          userWorkspaceRoleMap: workspaceContext.userWorkspaceRoleMap,
          apiKeyRoleMap: workspaceContext.apiKeyRoleMap,
        });

        const workspaceMemberRepo =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            rolePermissionConfig ?? undefined,
          );

        const member = await workspaceMemberRepo.findOne({
          where: { id: workspaceMemberId },
        });

        if (!member) {
          throw new NotFoundError(
            `Workspace member with id ${workspaceMemberId} not found`,
          );
        }

        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { userId: member.userId, workspaceId },
        });

        if (!userWorkspace) {
          throw new NotFoundError(
            `UserWorkspace not found for userId ${member.userId} in workspace ${workspaceId}`,
          );
        }

        const userWorkspaceId = userWorkspace.id;

        const existingAccount = connectedAccountId
          ? await this.connectedAccountRepository.findOne({
              where: { id: connectedAccountId, workspaceId },
            })
          : await this.connectedAccountRepository.findOne({
              where: {
                handle,
                userWorkspaceId,
                workspaceId,
              },
            });

        const newOrExistingAccountId =
          existingAccount?.id ?? connectedAccountId ?? v4();

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
            await transactionManager
              .getRepository(ConnectedAccountEntity)
              .save({
                id: newOrExistingAccountId,
                handle,
                provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
                connectionParameters: input.connectionParameters,
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
            member.userId,
            workspaceId,
            newOrExistingAccountId,
          );
        }

        if (shouldCreateMessageChannel) {
          const newMessageChannel = await this.messageChannelRepository.findOne(
            {
              where: {
                connectedAccountId: newOrExistingAccountId,
                workspaceId,
              },
              relations: ['connectedAccount', 'messageFolders'],
            },
          );

          if (isDefined(newMessageChannel)) {
            await this.syncMessageFoldersService.syncMessageFolders({
              messageChannel: newMessageChannel,
              workspaceId,
            });
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
      },
    );
  }
}
