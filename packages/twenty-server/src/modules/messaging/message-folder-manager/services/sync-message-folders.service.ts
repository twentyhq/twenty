import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/microsoft-get-all-folders.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

type SyncMessageFoldersInput = {
  workspaceId: string;
  messageChannelId: string;
  connectedAccount: MessageChannelWorkspaceEntity['connectedAccount'];
  manager: WorkspaceEntityManager;
};

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
    const { workspaceId, messageChannelId, connectedAccount, manager } = input;

    const folders = await this.discoverAllFolders(connectedAccount);

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

    const existingFolderMap = await this.buildExistingFolderMap({
      messageChannelId,
      messageFolderRepository,
    });

    for (const folder of folders) {
      const existingFolder = this.findExistingFolderInMap(
        existingFolderMap,
        folder,
      );

      if (existingFolder) {
        await messageFolderRepository.update(
          existingFolder.id,
          {
            name: folder.name,
            isSynced: folder.isSynced,
            isSentFolder: folder.isSentFolder,
            externalId: folder.externalId,
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
    connectedAccount: MessageChannelWorkspaceEntity['connectedAccount'],
  ): Promise<MessageFolder[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return await this.gmailGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return await this.microsoftGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return await this.imapGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
        );
      default:
        throw new Error(
          `Provider ${connectedAccount.provider} is not supported`,
        );
    }
  }

  private async buildExistingFolderMap({
    messageChannelId,
    messageFolderRepository,
  }: {
    messageChannelId: string;
    messageFolderRepository: WorkspaceRepository<MessageFolderWorkspaceEntity>;
  }): Promise<Map<string, MessageFolderWorkspaceEntity>> {
    const existingFolders = await messageFolderRepository.find({
      where: { messageChannelId },
    });

    const existingFolderMap = new Map<string, MessageFolderWorkspaceEntity>();

    for (const existingFolder of existingFolders) {
      if (isDefined(existingFolder.externalId)) {
        existingFolderMap.set(existingFolder.externalId, existingFolder);
      }
      existingFolderMap.set(existingFolder.name, existingFolder);
    }

    return existingFolderMap;
  }

  private findExistingFolderInMap(
    existingFolderMap: Map<string, MessageFolderWorkspaceEntity>,
    folder: MessageFolder,
  ): MessageFolderWorkspaceEntity | undefined {
    if (isDefined(folder.externalId)) {
      const existingFolder = existingFolderMap.get(folder.externalId);

      if (existingFolder) {
        return existingFolder;
      }
    }

    const legacyFolderName = this.getLegacyFolderName(folder);

    return existingFolderMap.get(legacyFolderName);
  }

  private getLegacyFolderName(folder: MessageFolder): string {
    if (folder.isSynced && !folder.isSentFolder) {
      return MessageFolderName.INBOX;
    }

    if (folder.isSynced && folder.isSentFolder) {
      return MessageFolderName.SENT_ITEMS;
    }

    return folder.name;
  }
}
