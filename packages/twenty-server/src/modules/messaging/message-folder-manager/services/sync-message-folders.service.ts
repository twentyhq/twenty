import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import deepEqual from 'deep-equal';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageFolderPendingSyncAction,
  type MessageFolderWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { GmailGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/gmail/services/gmail-get-all-folders.service';
import { ImapGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/imap/services/imap-get-all-folders.service';
import { MicrosoftGetAllFoldersService } from 'src/modules/messaging/message-folder-manager/drivers/microsoft/services/microsoft-get-all-folders.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';

type SyncMessageFoldersInput = {
  workspaceId: string;
  messageChannel: Pick<
    MessageChannelWorkspaceEntity,
    'messageFolderImportPolicy' | 'connectedAccount' | 'id'
  >;
  manager: WorkspaceEntityManager;
};

type MessageFolderToInsert = Pick<
  MessageFolderWorkspaceEntity,
  | 'id'
  | 'messageChannelId'
  | 'name'
  | 'syncCursor'
  | 'isSynced'
  | 'isSentFolder'
  | 'externalId'
  | 'parentFolderId'
>;

type MessageFolderToUpdate = Partial<
  Pick<
    MessageFolderWorkspaceEntity,
    'name' | 'externalId' | 'isSentFolder' | 'parentFolderId'
  >
>;

@Injectable()
export class SyncMessageFoldersService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailGetAllFoldersService: GmailGetAllFoldersService,
    private readonly microsoftGetAllFoldersService: MicrosoftGetAllFoldersService,
    private readonly imapGetAllFoldersService: ImapGetAllFoldersService,
  ) {}

  async syncMessageFolders(input: SyncMessageFoldersInput): Promise<void> {
    const { workspaceId, messageChannel, manager } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const folders = await this.discoverAllFolders(
          messageChannel.connectedAccount,
          messageChannel,
        );

        await this.upsertDiscoveredFolders({
          workspaceId,
          messageChannelId: messageChannel.id,
          folders,
          manager,
        });
      },
    );
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
      await this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    const existingFolderMap = await this.buildExistingFolderMap({
      messageChannelId,
      messageFolderRepository,
    });

    const inserts: MessageFolderToInsert[] = [];
    const updates: [string, MessageFolderToUpdate][] = [];
    const foldersToMarkForDeletion: string[] = [];

    const discoveredExternalIds = new Set(
      folders
        .filter((folder) => folder.externalId)
        .map((folder) => folder.externalId!),
    );

    for (const existingFolder of existingFolderMap.values()) {
      if (
        existingFolder.externalId &&
        !discoveredExternalIds.has(existingFolder.externalId)
      ) {
        foldersToMarkForDeletion.push(existingFolder.id);
      }
    }

    for (const folder of folders) {
      const existingFolder = this.findExistingFolderInMap(
        existingFolderMap,
        folder,
      );

      if (existingFolder) {
        const folderSyncData = {
          name: folder.name,
          externalId: folder.externalId,
          isSentFolder: folder.isSentFolder,
          parentFolderId: isNonEmptyString(folder.parentFolderId)
            ? folder.parentFolderId
            : null,
        };

        const existingFolderData = {
          name: existingFolder.name,
          externalId: existingFolder.externalId,
          isSentFolder: existingFolder.isSentFolder,
          parentFolderId: isNonEmptyString(existingFolder.parentFolderId)
            ? existingFolder.parentFolderId
            : null,
        };

        if (!deepEqual(folderSyncData, existingFolderData)) {
          updates.push([existingFolder.id, folderSyncData]);
        }
        continue;
      }

      inserts.push({
        id: v4(),
        messageChannelId,
        name: folder.name,
        syncCursor: '',
        isSynced: folder.isSynced,
        isSentFolder: folder.isSentFolder,
        externalId: folder.externalId,
        parentFolderId: folder.parentFolderId,
      });
    }

    if (inserts.length > 0) {
      await messageFolderRepository.insert(inserts, manager);
    }

    if (updates.length > 0) {
      await messageFolderRepository.updateMany(
        updates.map(([id, data]) => ({
          criteria: id,
          partialEntity: data,
        })),
        manager,
      );
    }

    if (foldersToMarkForDeletion.length > 0) {
      await messageFolderRepository.updateMany(
        foldersToMarkForDeletion.map((id) => ({
          criteria: id,
          partialEntity: {
            pendingSyncAction: MessageFolderPendingSyncAction.FOLDER_DELETION,
          },
        })),
        manager,
      );
    }
  }

  async discoverAllFolders(
    connectedAccount: MessageChannelWorkspaceEntity['connectedAccount'],
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<MessageFolder[]> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return await this.gmailGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return await this.microsoftGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return await this.imapGetAllFoldersService.getAllMessageFolders(
          connectedAccount,
          messageChannel,
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
      existingFolderMap.set(existingFolder.name ?? '', existingFolder);
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

    return folder.name ?? '';
  }
}
