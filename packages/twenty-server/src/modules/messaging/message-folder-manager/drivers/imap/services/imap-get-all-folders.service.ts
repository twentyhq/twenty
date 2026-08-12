import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow, type ListResponse } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import {
  DiscoveredMessageFolder,
  type MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { shouldCreateFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-create-folder-by-default.util';
import { shouldSyncFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-sync-folder-by-default.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import {
  getImapFolderPath,
  normalizeImapMailboxPath,
} from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';
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
      'id' | 'provider' | 'connectionParameters' | 'handle' | 'workspaceId'
    >,
    messageChannel: Pick<MessageChannelEntity, 'messageFolderImportPolicy'>,
    existingFolders: MessageFolder[] = [],
  ): Promise<DiscoveredMessageFolder[]> {
    try {
      const client = await this.imapClientProvider.getClient(
        connectedAccount.id,
      );

      const folders = await this.filterAndMapFolders(
        client,
        await client.list(),
        messageChannel,
        existingFolders,
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
    existingFolders: MessageFolder[],
  ): Promise<DiscoveredMessageFolder[]> {
    const normalizedMailboxList = mailboxList.map((mailbox) => ({
      ...mailbox,
      path: normalizeImapMailboxPath(mailbox.path, client),
      name: normalizeImapMailboxPath(mailbox.name, client),
      parentPath: mailbox.parentPath
        ? normalizeImapMailboxPath(mailbox.parentPath, client)
        : mailbox.parentPath,
    }));
    const existingExternalIdsByNormalizedId = new Map<string, string>();

    for (const folder of existingFolders) {
      if (isDefined(folder.externalId)) {
        existingExternalIdsByNormalizedId.set(
          normalizeImapMailboxPath(folder.externalId, client),
          folder.externalId,
        );
      }
    }

    const folders: DiscoveredMessageFolder[] = [];
    const pathToExternalIdMap = new Map<string, string>();
    const sentFolder =
      await this.imapFindSentFolderService.findSentFolder(client);
    const sentFolderPath = isDefined(sentFolder)
      ? normalizeImapMailboxPath(sentFolder.path, client)
      : undefined;

    const sentMailbox = isDefined(sentFolder)
      ? normalizedMailboxList.find((mailbox) => mailbox.path === sentFolderPath)
      : undefined;

    if (
      isDefined(sentFolder) &&
      isDefined(sentFolderPath) &&
      isDefined(sentMailbox) &&
      this.isMailboxSelectable(sentMailbox)
    ) {
      const uidValidity = await this.getUidValidity(client, sentMailbox);

      const normalizedExternalId = uidValidity
        ? `${sentFolderPath}:${uidValidity.toString()}`
        : sentFolderPath;
      const externalId =
        existingExternalIdsByNormalizedId.get(normalizedExternalId) ??
        normalizedExternalId;

      pathToExternalIdMap.set(sentFolderPath, externalId);

      folders.push({
        externalId,
        name: sentMailbox.name,
        isSynced: true,
        isSentFolder: true,
        parentFolderId: sentMailbox?.parentPath || null,
      });
    }

    for (const mailbox of normalizedMailboxList) {
      if (!this.isValidMailbox(client, mailbox, folders)) {
        if (!pathToExternalIdMap.has(mailbox.path)) {
          pathToExternalIdMap.set(mailbox.path, mailbox.path);
        }
        continue;
      }

      const uidValidity = await this.getUidValidity(client, mailbox);
      const normalizedExternalId = uidValidity
        ? `${mailbox.path}:${uidValidity}`
        : mailbox.path;
      const externalId =
        existingExternalIdsByNormalizedId.get(normalizedExternalId) ??
        normalizedExternalId;

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
    client: ImapFlow,
    mailbox: ListResponse,
    existingFolders: DiscoveredMessageFolder[],
  ): boolean {
    if (!this.isMailboxSelectable(mailbox)) {
      return false;
    }

    const isDuplicate = existingFolders.some(
      (folder) => getImapFolderPath(folder.externalId, client) === mailbox.path,
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
