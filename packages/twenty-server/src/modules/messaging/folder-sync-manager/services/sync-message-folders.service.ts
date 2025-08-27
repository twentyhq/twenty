import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-all-folders.service';

type SyncMessageFoldersInput = {
  workspaceId: string;
  messageChannelId: string;
  manager: WorkspaceEntityManager;
};

type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'name' | 'isSynced' | 'isSentFolder' | 'externalId'
>;

@Injectable()
export class SyncMessageFoldersService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
    private readonly gmailGetAllFoldersService: GmailGetAllFoldersService,
    private readonly microsoftGetAllFoldersService: MicrosoftGetAllFoldersService,
    private readonly imapGetAllFoldersService: ImapGetAllFoldersService,
  ) {}

  async syncMessageFolders(input: SyncMessageFoldersInput): Promise<void> {
    const { workspaceId, messageChannelId, manager } = input;

    const isFolderControlEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_FOLDER_CONTROL_ENABLED,
        workspaceId,
      );

    if (!isFolderControlEnabled) {
      return;
    }

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne(
      {
        where: { id: messageChannelId },
        relations: ['connectedAccount'],
      },
      manager,
    );

    if (!messageChannel) {
      throw new Error(`Message channel ${messageChannelId} not found`);
    }

    const folders = await this.discoverAllFolders(messageChannel);

    await this.upsertDiscoveredFolders({
      workspaceId,
      messageChannelId,
      folders,
      manager,
    });
  }

  private async upsertDiscoveredFolders({
    workspaceId,
    messageChannelId,
    folders,
    manager,
  }: {
    workspaceId: string;
    messageChannelId: string;
    folders: MessageFolder[];
    manager: WorkspaceEntityManager;
  }): Promise<void> {
    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    for (const folder of folders) {
      const existingFolder = await messageFolderRepository.findOne(
        {
          where: {
            messageChannelId,
            externalId: isDefined(folder.externalId)
              ? folder.externalId
              : IsNull(),
          },
        },
        manager,
      );

      if (existingFolder) {
        await messageFolderRepository.update(
          existingFolder.id,
          {
            name: folder.name,
            isSynced: folder.isSynced,
            isSentFolder: folder.isSentFolder,
          },
          manager,
        );
      } else {
        await messageFolderRepository.save(
          {
            id: v4(),
            messageChannelId,
            name: folder.name,
            syncCursor: '',
            isSynced: folder.isSynced,
            isSentFolder: folder.isSentFolder,
            externalId: folder.externalId,
          },
          {},
          manager,
        );
      }
    }
  }

  async discoverAllFolders(
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<MessageFolder[]> {
    switch (messageChannel.connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return await this.gmailGetAllFoldersService.getAllMessageFolders(
          messageChannel.connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return await this.microsoftGetAllFoldersService.getAllMessageFolders(
          messageChannel.connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return await this.imapGetAllFoldersService.getAllMessageFolders(
          messageChannel.connectedAccount,
        );
      default:
        throw new Error(
          `Provider ${messageChannel.connectedAccount.provider} is not supported`,
        );
    }
  }
}
