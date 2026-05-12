import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow, type ListResponse } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import {
  DiscoveredMessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { shouldCreateFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-create-folder-by-default.util';
import { shouldSyncFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-sync-folder-by-default.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';
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
      ConnectedAccountEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
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
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
  ): Promise<DiscoveredMessageFolder[]> {
    const folders: DiscoveredMessageFolder[] = [];
    const pathToExternalIdMap = new Map<string, string>();
    const sentFolder =
      await this.imapFindSentFolderService.findSentFolder(client);

    const sentMailbox = isDefined(sentFolder)
      ? mailboxList.find((mailbox) => mailbox.path === sentFolder.path)
      : undefined;

    if (
      isDefined(sentFolder) &&
      isDefined(sentMailbox) &&
      this.isMailboxSelectable(sentMailbox)
    ) {
      const uidValidity = await this.getUidValidity(client, sentMailbox);

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
      if (!this.isValidMailbox(mailbox, folders)) {
        if (!pathToExternalIdMap.has(mailbox.path)) {
          pathToExternalIdMap.set(mailbox.path, mailbox.path);
        }
        continue;
      }

      const uidValidity = await this.getUidValidity(client, mailbox);
      const externalId = uidValidity
        ? `${mailbox.path}:${uidValidity}`
        : mailbox.path;

      pathToExternalIdMap.set(mailbox.path, externalId);

      const standardFolder = getStandardFolderByRegex(mailbox.name);

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

    for (const folder of folders) {
      if (folder.parentFolderId) {
        const parentExternalId = pathToExternalIdMap.get(folder.parentFolderId);

        folder.parentFolderId = parentExternalId || null;
      }
    }

    return folders;
  }

  private isMailboxSelectable(mailbox: ListResponse): boolean {
    // Per RFC 3501, IMAP attribute names are case-insensitive. Different
    // servers vary the spelling (Dovecot: \Noselect, Stalwart: \NoSelect),
    // so we compare lowercased to avoid attempting SELECT on a virtual
    // namespace placeholder, which the server would reject as NONEXISTENT.
    if (!mailbox.flags) {
      return true;
    }

    for (const flag of mailbox.flags) {
      if (flag.toLowerCase() === '\\noselect') {
        return false;
      }
    }

    return true;
  }

  private isValidMailbox(
    mailbox: ListResponse,
    existingFolders: DiscoveredMessageFolder[],
  ): boolean {
    if (!this.isMailboxSelectable(mailbox)) {
      return false;
    }

    const isDuplicate = existingFolders.some(
      (folder) => getImapFolderPath(folder?.externalId) === mailbox.path,
    );

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
