import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow, type ListResponse } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import {
  DiscoveredMessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { shouldCreateFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-create-folder-by-default.util';
import { shouldSyncFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-sync-folder-by-default.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

@Injectable()
export class ImapGetAllFoldersService implements MessageFolderDriver {
  private readonly logger = new Logger(ImapGetAllFoldersService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapFindSentFolderService: ImapFindSentFolderService,
  ) {}

  public async getAllMessageFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<DiscoveredMessageFolder[]> {
    try {
      const client = await this.imapClientProvider.getClient(connectedAccount);

      const mailboxList = await client.list();

      const folders = await this.filterAndMapFolders(
        client,
        mailboxList,
        messageChannel,
      );

      await this.imapClientProvider.closeClient(client);

      return folders;
    } catch (error) {
      this.logger.error(
        `Failed to get IMAP folders for account ${connectedAccount.handle}:`,
        error,
      );

      throw error;
    }
  }

  private async filterAndMapFolders(
    client: ImapFlow,
    mailboxList: ListResponse[],
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'messageFolderImportPolicy'
    >,
  ): Promise<DiscoveredMessageFolder[]> {
    const folders: DiscoveredMessageFolder[] = [];
    const pathToExternalIdMap = new Map<string, string>();
    const sentFolder =
      await this.imapFindSentFolderService.findSentFolder(client);

    if (isDefined(sentFolder)) {
      const sentMailbox = mailboxList.find((m) => m.path === sentFolder.path);
      const uidValidity = sentMailbox
        ? await this.getUidValidity(client, sentMailbox)
        : null;

      const externalId = uidValidity
        ? `${sentFolder.path}:${uidValidity.toString()}`
        : sentFolder.path;

      pathToExternalIdMap.set(sentFolder.path, externalId);

      folders.push({
        externalId,
        name: sentFolder.name,
        isSynced: true,
        isSentFolder: true,
        parentFolderId: sentMailbox?.parentPath || null,
      });
    }

    for (const mailbox of mailboxList) {
      const uidValidity = await this.getUidValidity(client, mailbox);
      const externalId = uidValidity
        ? `${mailbox.path}:${uidValidity}`
        : mailbox.path;

      pathToExternalIdMap.set(mailbox.path, externalId);

      if (this.isValidMailbox(mailbox, folders)) {
        const standardFolder = getStandardFolderByRegex(mailbox.path);

        if (!shouldCreateFolderByDefault(standardFolder)) {
          continue;
        }

        const isSynced = shouldSyncFolderByDefault(
          messageChannel.messageFolderImportPolicy,
        );

        folders.push({
          externalId,
          name: mailbox.name,
          isSynced,
          isSentFolder: false,
          parentFolderId: mailbox.parentPath || null,
        });
      }
    }

    for (const folder of folders) {
      if (folder.parentFolderId) {
        const parentExternalId = pathToExternalIdMap.get(folder.parentFolderId);

        folder.parentFolderId = parentExternalId || null;
      }
    }

    return folders;
  }

  private isValidMailbox(
    mailbox: ListResponse,
    existingFolders: DiscoveredMessageFolder[],
  ): boolean {
    if (mailbox.flags?.has('\\Noselect')) {
      return false;
    }

    const isDuplicate = existingFolders.some((folder) => {
      const folderPath = folder?.externalId?.split(':')[0];

      if (!isDefined(folderPath)) {
        return false;
      }

      return folderPath === mailbox.path;
    });

    return !isDuplicate;
  }

  private async getUidValidity(
    client: ImapFlow,
    mailbox: ListResponse,
  ): Promise<bigint | null> {
    if (mailbox.status?.uidValidity) {
      return mailbox.status.uidValidity;
    }

    try {
      const status = await client.status(mailbox.path, {
        uidValidity: true,
      });

      return status.uidValidity ?? null;
    } catch (error) {
      this.logger.warn(
        `Failed to get uidValidity for folder ${mailbox.path}:`,
        error,
      );

      return null;
    }
  }
}
