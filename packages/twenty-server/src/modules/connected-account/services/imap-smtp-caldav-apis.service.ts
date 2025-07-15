import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  AccountType,
  ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async setupConnectedAccount(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    accountType: AccountType;
    connectionParams: ConnectionParameters;
    connectedAccountId?: string;
  }) {
    const {
      handle,
      workspaceId,
      workspaceMemberId,
      connectionParams,
      connectedAccountId,
    } = input;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = connectedAccountId
      ? await connectedAccountRepository.findOne({
          where: { id: connectedAccountId },
        })
      : await connectedAccountRepository.findOne({
          where: { handle, accountOwnerId: workspaceMemberId },
        });

    const existingAccountId = connectedAccount?.id;
    const newOrExistingConnectedAccountId =
      existingAccountId ?? connectedAccountId ?? v4();

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    let shouldEnableSync = false;

    if (connectedAccount) {
      const hadOnlySmtp =
        connectedAccount.connectionParameters?.SMTP &&
        !connectedAccount.connectionParameters?.IMAP &&
        !connectedAccount.connectionParameters?.CALDAV;

      const isAddingImapOrCaldav =
        input.accountType === 'IMAP' || input.accountType === 'CALDAV';

      shouldEnableSync = Boolean(hadOnlySmtp && isAddingImapOrCaldav);
    }

    await workspaceDataSource.transaction(async () => {
      if (!existingAccountId) {
        const newConnectedAccount = await connectedAccountRepository.save(
          {
            id: newOrExistingConnectedAccountId,
            handle,
            provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
            connectionParameters: {
              [input.accountType]: connectionParams,
            },
            accountOwnerId: workspaceMemberId,
          },
          {},
        );

        const connectedAccountMetadata =
          await this.objectMetadataRepository.findOneOrFail({
            where: { nameSingular: 'connectedAccount', workspaceId },
          });

        this.workspaceEventEmitter.emitDatabaseBatchEvent({
          objectMetadataNameSingular: 'connectedAccount',
          action: DatabaseEventAction.CREATED,
          events: [
            {
              recordId: newConnectedAccount.id,
              objectMetadata: connectedAccountMetadata,
              properties: {
                after: newConnectedAccount,
              },
            },
          ],
          workspaceId,
        });

        const newMessageChannel = await messageChannelRepository.save(
          {
            id: v4(),
            connectedAccountId: newOrExistingConnectedAccountId,
            type: MessageChannelType.EMAIL,
            handle,
            isSyncEnabled: shouldEnableSync,
            syncStatus: shouldEnableSync
              ? MessageChannelSyncStatus.ONGOING
              : MessageChannelSyncStatus.NOT_SYNCED,
          },
          {},
        );

        const messageChannelMetadata =
          await this.objectMetadataRepository.findOneOrFail({
            where: { nameSingular: 'messageChannel', workspaceId },
          });

        this.workspaceEventEmitter.emitDatabaseBatchEvent({
          objectMetadataNameSingular: 'messageChannel',
          action: DatabaseEventAction.CREATED,
          events: [
            {
              recordId: newMessageChannel.id,
              objectMetadata: messageChannelMetadata,
              properties: {
                after: newMessageChannel,
              },
            },
          ],
          workspaceId,
        });
      } else {
        const updatedConnectedAccount = await connectedAccountRepository.update(
          {
            id: newOrExistingConnectedAccountId,
          },
          {
            connectionParameters: {
              ...connectedAccount.connectionParameters,
              [input.accountType]: connectionParams,
            },
          },
        );

        const connectedAccountMetadata =
          await this.objectMetadataRepository.findOneOrFail({
            where: { nameSingular: 'connectedAccount', workspaceId },
          });

        this.workspaceEventEmitter.emitDatabaseBatchEvent({
          objectMetadataNameSingular: 'connectedAccount',
          action: DatabaseEventAction.UPDATED,
          events: [
            {
              recordId: newOrExistingConnectedAccountId,
              objectMetadata: connectedAccountMetadata,
              properties: {
                before: connectedAccount,
                after: {
                  ...connectedAccount,
                  ...updatedConnectedAccount.raw[0],
                },
              },
            },
          ],
          workspaceId,
        });

        const messageChannels = await messageChannelRepository.find({
          where: { connectedAccountId: newOrExistingConnectedAccountId },
        });

        const messageChannelUpdates = await messageChannelRepository.update(
          {
            connectedAccountId: newOrExistingConnectedAccountId,
          },
          {
            syncStage: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
            syncStatus: shouldEnableSync
              ? MessageChannelSyncStatus.ONGOING
              : MessageChannelSyncStatus.NOT_SYNCED,
            syncCursor: '',
            syncStageStartedAt: null,
            isSyncEnabled: shouldEnableSync,
          },
        );

        const messageChannelMetadata =
          await this.objectMetadataRepository.findOneOrFail({
            where: { nameSingular: 'messageChannel', workspaceId },
          });

        this.workspaceEventEmitter.emitDatabaseBatchEvent({
          objectMetadataNameSingular: 'messageChannel',
          action: DatabaseEventAction.UPDATED,
          events: messageChannels.map((messageChannel) => ({
            recordId: messageChannel.id,
            objectMetadata: messageChannelMetadata,
            properties: {
              before: messageChannel,
              after: { ...messageChannel, ...messageChannelUpdates.raw[0] },
            },
          })),
          workspaceId,
        });
      }
    });

    if (!shouldEnableSync) {
      return;
    }

    const messageChannels = await messageChannelRepository.find({
      where: {
        connectedAccountId: newOrExistingConnectedAccountId,
      },
    });

    for (const messageChannel of messageChannels) {
      await this.messageQueueService.add<MessagingMessageListFetchJobData>(
        MessagingMessageListFetchJob.name,
        {
          workspaceId,
          messageChannelId: messageChannel.id,
        },
      );
    }
  }
}
