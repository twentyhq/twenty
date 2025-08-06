import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/imap/types/folders';
import { findSentMailbox } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/find-sent-mailbox.util';
import { GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  GetMessageListsResponse,
  GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

@Injectable()
export class ImapGetMessageListService {
  private readonly logger = new Logger(ImapGetMessageListService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapHandleErrorService: ImapHandleErrorService,
  ) {}

  public async getMessageLists({
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    let client: ImapFlow | null = null;

    try {
      client = await this.imapClientProvider.getClient(connectedAccount);
      const result: GetMessageListsResponse = [];

      for (const folder of messageFolders) {
        const mailboxName = await this.getMailboxName(client, folder.name);

        if (!mailboxName) {
          continue;
        }

        try {
          const response = await this.getMessageList(
            client,
            mailboxName,
            folder,
          );

          result.push({
            ...response,
            folderId: folder.id,
          });
        } catch (error) {
          this.logger.warn(
            `Error fetching from folder ${folder.name} (${mailboxName}): ${error.message}. Continuing with other folders.`,
          );

          result.push({
            messageExternalIds: [],
            nextSyncCursor: folder.syncCursor || '',
            previousSyncCursor: folder.syncCursor,
            messageExternalIdsToDelete: [],
            folderId: folder.id,
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Error getting message list: ${error.message}`,
        error.stack,
      );

      this.imapHandleErrorService.handleImapMessageListFetchError(error);

      return messageFolders.map((folder) => ({
        messageExternalIds: [],
        nextSyncCursor: folder.syncCursor || '',
        previousSyncCursor: folder.syncCursor,
        messageExternalIdsToDelete: [],
        folderId: folder.id,
      }));
    } finally {
      if (client) {
        await this.imapClientProvider.closeClient(client);
      }
    }
  }

  public async getMessageList(
    client: ImapFlow,
    mailbox: string,
    messageFolder: Pick<MessageFolderWorkspaceEntity, 'syncCursor'>,
  ): Promise<GetOneMessageListResponse> {
    const messages = await this.getMessagesFromMailbox(
      client,
      mailbox,
      messageFolder.syncCursor,
    );

    messages.sort((a, b) => parseInt(b.uid) - parseInt(a.uid));

    const messageExternalIds = messages.map((message) => message.id);

    const nextSyncCursor =
      messages.length > 0 ? messages[0].uid : messageFolder.syncCursor || '';

    return {
      messageExternalIds,
      nextSyncCursor,
      previousSyncCursor: messageFolder.syncCursor || '',
      messageExternalIdsToDelete: [],
      folderId: undefined,
    };
  }

  private async getMailboxName(
    client: ImapFlow,
    folderName: string,
  ): Promise<string | null> {
    if (folderName === MessageFolderName.INBOX) {
      return 'INBOX';
    }

    if (folderName === MessageFolderName.SENT_ITEMS) {
      const sentMailbox = await findSentMailbox(client, this.logger);

      if (!sentMailbox) {
        this.logger.warn('SENT folder not found, skipping');

        return null;
      }

      return sentMailbox;
    }

    return folderName;
  }

  private async getMessagesFromMailbox(
    client: ImapFlow,
    mailbox: string,
    cursor?: string,
  ): Promise<{ id: string; uid: string }[]> {
    let lock;

    try {
      lock = await client.getMailboxLock(mailbox);

      let searchOptions = {};

      if (cursor) {
        const cursorUid = parseInt(cursor);

        if (!isNaN(cursorUid)) {
          searchOptions = {
            uid: `${cursorUid + 1}:*`,
          };
        }
      }

      const messages: { id: string; uid: string }[] = [];

      for await (const message of client.fetch(searchOptions, {
        envelope: true,
        uid: true,
      })) {
        if (message.envelope?.messageId && message.uid) {
          messages.push({
            id: message.envelope.messageId,
            uid: message.uid.toString(),
          });
        }
      }

      return messages;
    } catch (error) {
      this.logger.error(
        `Error fetching from mailbox ${mailbox}: ${error.message}`,
        error.stack,
      );

      return [];
    } finally {
      if (lock) {
        lock.release();
      }
    }
  }
}
