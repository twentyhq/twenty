import { Injectable, Logger } from '@nestjs/common';

import { FetchQueryObject, type ImapFlow } from 'imapflow';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindSentFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-sent-folder.service';
import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/imap/types/folders';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

@Injectable()
export class ImapGetMessageListService {
  private readonly logger = new Logger(ImapGetMessageListService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapFindSentFolderService: ImapFindSentFolderService,
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
        this.logger.log(`Processing folder: ${folder.name}`);
        const folderName = await this.getFolderName(client, folder.name);

        if (!folderName) {
          this.logger.warn(`No folder name found for folder: ${folder.name}`);
          continue;
        }

        try {
          const response = await this.getMessageList(
            client,
            folderName,
            folder,
          );

          result.push({
            ...response,
            folderId: folder.id,
          });
        } catch (error) {
          this.logger.warn(
            `Error fetching from folder ${folder.name} (${folderName}): ${error.message}. Continuing with other folders.`,
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
    folder: string,
    messageFolder: Pick<MessageFolderWorkspaceEntity, 'syncCursor'>,
  ): Promise<GetOneMessageListResponse> {
    const messages = await this.getMessagesFromFolder(
      client,
      folder,
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

  private async getFolderName(
    client: ImapFlow,
    folderName: string,
  ): Promise<string | null> {
    if (folderName === MessageFolderName.INBOX) {
      return 'INBOX';
    }

    if (folderName === MessageFolderName.SENT_ITEMS) {
      const sentFolder =
        await this.imapFindSentFolderService.findSentFolder(client);

      if (!sentFolder) {
        this.logger.warn('SENT folder not found, skipping');

        return null;
      }

      return sentFolder;
    }

    return folderName;
  }

  private async getMessagesFromFolder(
    client: ImapFlow,
    folder: string,
    cursor?: string,
  ): Promise<{ id: string; uid: string }[]> {
    let lock;

    try {
      lock = await client.getMailboxLock(folder);

      const supportsUidPlus = client.capabilities.has('UIDPLUS');
      let sequence = '1:*';

      if (cursor && supportsUidPlus) {
        const cursorUid = parseInt(cursor);

        if (!isNaN(cursorUid)) {
          sequence = `${cursorUid + 1}:*`;
        }
      }

      const messages: { id: string; uid: string }[] = [];

      this.logger.log(
        `Fetching from folder: ${folder} with sequence: ${sequence} (UIDPLUS: ${supportsUidPlus})`,
      );

      const fetchOptions: FetchQueryObject = {
        envelope: true,
      };

      if (supportsUidPlus) {
        fetchOptions.uid = true;
      }

      for await (const message of client.fetch(sequence, fetchOptions)) {
        if (message.envelope?.messageId) {
          messages.push({
            id: message.envelope.messageId,
            uid:
              supportsUidPlus && message.uid
                ? message.uid.toString()
                : message.seq?.toString() || '0',
          });
        }
      }

      this.logger.log(`Found ${messages.length} messages in folder: ${folder}`);

      return messages;
    } catch (error) {
      this.logger.error(
        `Error fetching from folder ${folder}: ${error.message}`,
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
