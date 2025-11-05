import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  type CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async processAccount(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    connectionParameters: EmailAccountConnectionParameters;
    connectedAccountId?: string;
  }): Promise<string> {
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

    let messageChannel: MessageChannelWorkspaceEntity | null = existingAccount
      ? await messageChannelRepository.findOne({
          where: { connectedAccountId: existingAccount.id },
        })
      : null;

    let calendarChannel: CalendarChannelWorkspaceEntity | null = existingAccount
      ? await calendarChannelRepository.findOne({
          where: { connectedAccountId: existingAccount.id },
        })
      : null;

    await workspaceDataSource.transaction(async () => {
      await this.upsertConnectedAccount(
        input,
        accountId,
        connectedAccountRepository,
      );

      if (!messageChannel) {
        messageChannel = await this.setupMessageChannels(
          input,
          accountId,
          messageChannelRepository,
        );
      }

      if (!calendarChannel) {
        calendarChannel = await this.setupCalendarChannels(
          input,
          accountId,
          calendarChannelRepository,
        );
      }
    });

    return accountId;
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
  ): Promise<MessageChannelWorkspaceEntity | null> {
    const shouldEnableSync = Boolean(input.connectionParameters.IMAP);

    const newMessageChannel = await messageChannelRepository.save(
      {
        id: v4(),
        connectedAccountId: accountId,
        type: MessageChannelType.EMAIL,
        handle: input.handle,
        isSyncEnabled: shouldEnableSync,
        syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
        syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      {},
    );

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
    const shouldCreateCalendarChannel = Boolean(
      input.connectionParameters.CALDAV,
    );

    if (shouldCreateCalendarChannel) {
      const newCalendarChannel = await calendarChannelRepository.save(
        {
          id: v4(),
          connectedAccountId: accountId,
          handle: input.handle,
          isSyncEnabled: shouldCreateCalendarChannel,
          syncStatus: CalendarChannelSyncStatus.NOT_SYNCED,
          syncStage: CalendarChannelSyncStage.PENDING_CONFIGURATION,
          syncCursor: '',
          syncStageStartedAt: null,
        },
        {},
      );

      return newCalendarChannel;
    }

    return null;
  }
}
