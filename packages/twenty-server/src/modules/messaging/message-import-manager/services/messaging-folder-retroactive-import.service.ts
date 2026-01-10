import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT } from 'src/modules/messaging/message-import-manager/drivers/gmail/constants/messaging-gmail-users-messages-list-max-result.constant';

const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

export type RetroactiveImportParams = {
  workspaceId: string;
  messageChannelId: string;
  messageFolderId: string;
  folderExternalId: string | null;
};

export type DryRunImportResult = {
  totalMessagesInFolder: number;
  messagesToImport: number;
  alreadyImported: number;
};

@Injectable()
export class MessagingFolderRetroactiveImportService {
  private readonly logger = new Logger(
    MessagingFolderRetroactiveImportService.name,
  );

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  async processRetroactiveImport(
    params: RetroactiveImportParams,
  ): Promise<void> {
    const { workspaceId, messageChannelId, folderExternalId } = params;

    if (!isDefined(folderExternalId)) {
      this.logger.warn(
        `Folder external ID is not defined, skipping retroactive import`,
      );

      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageChannelId },
          relations: ['connectedAccount'],
        });

        if (!messageChannel) {
          this.logger.warn(
            `Message channel ${messageChannelId} not found, skipping retroactive import`,
          );

          return;
        }

        const { connectedAccount } = messageChannel;

        if (connectedAccount.provider !== ConnectedAccountProvider.GOOGLE) {
          this.logger.log(
            `Retroactive import is only supported for Google accounts, skipping for provider ${connectedAccount.provider}`,
          );

          return;
        }

        const messageExternalIds = await this.fetchAllMessageIdsFromFolder(
          connectedAccount,
          folderExternalId,
        );

        this.logger.log(
          `Found ${messageExternalIds.length} messages in folder ${folderExternalId}`,
        );

        if (messageExternalIds.length === 0) {
          return;
        }

        const newMessageIds = await this.filterAlreadyImportedMessages(
          workspaceId,
          messageChannelId,
          messageExternalIds,
        );

        this.logger.log(
          `${newMessageIds.length} new messages to import from folder ${folderExternalId}`,
        );

        if (newMessageIds.length === 0) {
          return;
        }

        await this.cacheStorage.setAdd(
          `messages-to-import:${workspaceId}:${messageChannelId}`,
          newMessageIds,
          ONE_WEEK_IN_MILLISECONDS,
        );

        await this.messageChannelSyncStatusService.markAsMessagesImportPending(
          [messageChannelId],
          workspaceId,
        );

        this.logger.log(
          `Scheduled import for ${newMessageIds.length} messages from folder ${folderExternalId}`,
        );
      },
    );
  }

  async dryRunImport(
    params: RetroactiveImportParams,
  ): Promise<DryRunImportResult> {
    const { workspaceId, messageChannelId, folderExternalId } = params;

    if (!isDefined(folderExternalId)) {
      return {
        totalMessagesInFolder: 0,
        messagesToImport: 0,
        alreadyImported: 0,
      };
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: { id: messageChannelId },
          relations: ['connectedAccount'],
        });

        if (!messageChannel) {
          return {
            totalMessagesInFolder: 0,
            messagesToImport: 0,
            alreadyImported: 0,
          };
        }

        const { connectedAccount } = messageChannel;

        if (connectedAccount.provider !== ConnectedAccountProvider.GOOGLE) {
          return {
            totalMessagesInFolder: 0,
            messagesToImport: 0,
            alreadyImported: 0,
          };
        }

        const messageExternalIds = await this.fetchAllMessageIdsFromFolder(
          connectedAccount,
          folderExternalId,
        );

        const totalMessagesInFolder = messageExternalIds.length;

        if (totalMessagesInFolder === 0) {
          return {
            totalMessagesInFolder: 0,
            messagesToImport: 0,
            alreadyImported: 0,
          };
        }

        const newMessageIds = await this.filterAlreadyImportedMessages(
          workspaceId,
          messageChannelId,
          messageExternalIds,
        );

        return {
          totalMessagesInFolder,
          messagesToImport: newMessageIds.length,
          alreadyImported: totalMessagesInFolder - newMessageIds.length,
        };
      },
    );
  }

  private async fetchAllMessageIdsFromFolder(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
    labelId: string,
  ): Promise<string[]> {
    const messageIds: string[] = [];

    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    let pageToken: string | undefined;

    do {
      const response = await gmailClient.users.messages
        .list({
          userId: 'me',
          labelIds: [labelId],
          maxResults: MESSAGING_GMAIL_USERS_MESSAGES_LIST_MAX_RESULT,
          pageToken,
        })
        .catch((error) => {
          this.logger.error(
            `Error fetching messages from folder ${labelId}: ${error.message}`,
          );

          return { data: { messages: [], nextPageToken: undefined } };
        });

      const messages = response.data.messages || [];

      messageIds.push(
        ...messages.filter((m) => isDefined(m.id)).map((m) => m.id as string),
      );

      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return messageIds;
  }

  private async filterAlreadyImportedMessages(
    workspaceId: string,
    messageChannelId: string,
    messageExternalIds: string[],
  ): Promise<string[]> {
    const messageChannelMessageAssociationRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    const batchSize = 500;
    const existingExternalIds: string[] = [];

    for (let i = 0; i < messageExternalIds.length; i += batchSize) {
      const batch = messageExternalIds.slice(i, i + batchSize);

      const existingAssociations =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageChannelId,
            messageExternalId: In(batch),
          },
          select: ['messageExternalId'],
        });

      existingExternalIds.push(
        ...existingAssociations
          .filter((a: MessageChannelMessageAssociationWorkspaceEntity) =>
            isDefined(a.messageExternalId),
          )
          .map(
            (a: MessageChannelMessageAssociationWorkspaceEntity) =>
              a.messageExternalId as string,
          ),
      );
    }

    return messageExternalIds.filter((id) => !existingExternalIds.includes(id));
  }
}
