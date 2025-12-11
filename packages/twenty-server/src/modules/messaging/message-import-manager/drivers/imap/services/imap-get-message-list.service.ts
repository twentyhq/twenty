import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';

import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { ImapSyncService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-sync.service';
import { createSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/create-sync-cursor.util';
import { extractMailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';
import { parseSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

type MessageFolder = Pick<
  MessageFolderWorkspaceEntity,
  'id' | 'name' | 'syncCursor' | 'externalId'
>;

@Injectable()
export class ImapGetMessageListService {
  private readonly logger = new Logger(ImapGetMessageListService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapSyncService: ImapSyncService,
    private readonly errorHandler: ImapMessageListFetchErrorHandler,
  ) {}

  async getMessageLists({
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      const results: GetMessageListsResponse = [];

      for (const folder of messageFolders) {
        const response = await this.getMessageList(client, folder);

        results.push({ ...response, folderId: folder.id });
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Connected account ${connectedAccount.id}: Error fetching message list: ${error.message}`,
      );
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      await this.imapClientProvider.closeClient(client);
    }
  }

  private async getMessageList(
    client: ImapFlow,
    folder: MessageFolder,
  ): Promise<GetOneMessageListResponse> {
    const folderPath = folder.externalId?.split(':')[0];

    if (!folderPath) {
      throw new MessageImportDriverException(
        `Folder ${folder.name} has no path`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    this.logger.log(`Processing folder: ${folder.name}`);

    const lock = await client.getMailboxLock(folderPath);

    try {
      const mailbox = client.mailbox;

      if (!mailbox || typeof mailbox === 'boolean') {
        throw new MessageImportDriverException(
          `Invalid mailbox state for folder ${folderPath}`,
          MessageImportDriverExceptionCode.UNKNOWN,
        );
      }

      const mailboxState = extractMailboxState(mailbox);
      const previousCursor = parseSyncCursor(folder.syncCursor);

      const { messageUids } = await this.imapSyncService.syncFolder(
        client,
        folderPath,
        previousCursor,
        mailboxState,
      );

      const nextCursor = createSyncCursor(
        messageUids.map((uid) => ({ uid })),
        previousCursor,
        mailboxState,
      );

      const messageExternalIds = messageUids
        .sort((a, b) => b - a)
        .map((uid) => `${folderPath}:${uid}`);

      return {
        messageExternalIds,
        messageExternalIdsToDelete: [],
        nextSyncCursor: JSON.stringify(nextCursor),
        previousSyncCursor: folder.syncCursor,
        folderId: folder.id,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing folder ${folder.name}: ${error.message}`,
      );
      this.errorHandler.handleError(error);
      throw error;
    } finally {
      lock.release();
    }
  }
}
