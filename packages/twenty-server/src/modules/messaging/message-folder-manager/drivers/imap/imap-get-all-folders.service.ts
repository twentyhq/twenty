import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow, type ListResponse } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import {
  MessageFolder,
  MessageFolderDriver,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/imap/types/folders';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
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
  ): Promise<MessageFolder[]> {
    try {
      const client = await this.imapClientProvider.getClient(connectedAccount);

      const mailboxList = await client.list();

      const folders = await this.filterAndMapFolders(client, mailboxList);

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
  ): Promise<MessageFolder[]> {
    const folders: MessageFolder[] = [];
    const sentFolderPath =
      await this.imapFindSentFolderService.findSentFolder(client);

    if (isDefined(sentFolderPath)) {
      const sentMailbox = mailboxList.find((m) => m.path === sentFolderPath);
      const uidValidity = sentMailbox
        ? await this.getUidValidity(client, sentMailbox)
        : null;

      folders.push({
        externalId: uidValidity
          ? `${sentFolderPath}:${uidValidity.toString()}`
          : sentFolderPath,
        name: sentFolderPath,
        isSynced: true,
        isSentFolder: true,
      });
    }

    const validMailboxes = mailboxList.filter((mailbox) =>
      this.isValidMailbox(mailbox, folders),
    );

    for (const mailbox of validMailboxes) {
      const isInbox = await this.isInboxFolder(mailbox);
      const uidValidity = await this.getUidValidity(client, mailbox);

      folders.push({
        externalId: uidValidity
          ? `${mailbox.path}:${uidValidity}`
          : mailbox.path,
        name: mailbox.path,
        isSynced: isInbox,
        isSentFolder: false,
      });
    }

    return folders;
  }

  private isValidMailbox(
    mailbox: ListResponse,
    existingFolders: MessageFolder[],
  ): boolean {
    if (this.shouldExcludeFolder(mailbox)) {
      return false;
    }

    const isDuplicate = existingFolders.some(
      (folder) => folder.name === mailbox.path,
    );

    return !isDuplicate;
  }

  private async isInboxFolder(mailbox: ListResponse): Promise<boolean> {
    if (
      mailbox.path.toLowerCase() === MessageFolderName.INBOX ||
      mailbox.specialUse === '\\Inbox'
    ) {
      return true;
    }

    return false;
  }

  private shouldExcludeFolder(mailbox: ListResponse): boolean {
    if (mailbox.flags?.has('\\Noselect')) {
      return true;
    }

    if (
      mailbox.specialUse === '\\Drafts' ||
      mailbox.specialUse === '\\Trash' ||
      mailbox.specialUse === '\\Junk'
    ) {
      return true;
    }
    const standardFolder = getStandardFolderByRegex(mailbox.path);

    if (!standardFolder) {
      return false;
    }

    return (
      standardFolder !== StandardFolder.SENT &&
      standardFolder !== StandardFolder.INBOX
    );
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
