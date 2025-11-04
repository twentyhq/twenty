import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapIncrementalSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-incremental-sync.service';
import { createSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/create-sync-cursor.util';
import { extractMailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import {
  ImapSyncCursor,
  parseSyncCursor,
} from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';
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
    private readonly imapIncrementalSyncService: ImapIncrementalSyncService,
    private readonly imapMessageListFetchErrorHandler: ImapMessageListFetchErrorHandler,
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

        const folderPath = folder.externalId?.split(':')[0];

        if (!folderPath) {
          this.logger.warn(`Folder ${folder.name} has no path. Skipping.`);
          continue;
        }

        try {
          const response = await this.getMessageList(
            client,
            folderPath,
            folder,
          );

          result.push({
            ...response,
            folderId: folder.id,
          });
        } catch (error) {
          this.logger.warn(
            `Error fetching from folder ${folder.name}: ${error.message}. Continuing with other folders.`,
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

      this.imapMessageListFetchErrorHandler.handleError(error);

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
    const { messages, messageExternalUidsToDelete, syncCursor } =
      await this.getMessagesFromFolder(
        client,
        folder,
        messageFolder.syncCursor,
      );

    messages.sort((a, b) => b.uid - a.uid);

    const messageExternalIds = messages.map(
      (message) => `${folder}:${message.uid.toString()}`,
    );

    return {
      messageExternalIds,
      nextSyncCursor: JSON.stringify(syncCursor),
      previousSyncCursor: messageFolder.syncCursor || '',
      messageExternalIdsToDelete: messageExternalUidsToDelete.map((uid) =>
        uid.toString(),
      ),
      folderId: undefined,
    };
  }

  private async getMessagesFromFolder(
    client: ImapFlow,
    folder: string,
    cursor?: string,
  ): Promise<{
    messages: { uid: number }[];
    messageExternalUidsToDelete: number[];
    syncCursor: ImapSyncCursor;
  }> {
    let lock;

    try {
      lock = await client.getMailboxLock(folder);
      const mailbox = client.mailbox!;

      if (typeof mailbox === 'boolean') {
        throw new Error(`Invalid mailbox state for folder ${folder}`);
      }

      const mailboxState = extractMailboxState(mailbox);
      const previousCursor = parseSyncCursor(cursor);

      const { messages, messageExternalUidsToDelete } =
        await this.imapIncrementalSyncService.syncMessages(
          client,
          previousCursor,
          mailboxState,
          folder,
        );

      const newSyncCursor = createSyncCursor(
        messages,
        previousCursor,
        mailboxState,
      );

      return {
        messages,
        messageExternalUidsToDelete,
        syncCursor: newSyncCursor,
      };
    } catch (err) {
      this.logger.error(
        `Error fetching from folder ${folder}: ${err.message}`,
        err.stack,
      );

      throw err;
    } finally {
      if (lock) lock.release();
    }
  }
}
