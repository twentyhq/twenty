import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import { type MessageFolder } from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessagingSyncDriver } from 'src/modules/messaging/message-import-manager/drivers/interfaces/messaging-sync-driver.interface';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-list-fetch-error-handler.service';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

@Injectable()
export class ImapGetMessageListService
  implements MessagingSyncDriver<GetMessageListsArgs, GetMessageListsResponse>
{
  private readonly logger = new Logger(ImapGetMessageListService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly errorHandler: ImapMessageListFetchErrorHandler,
  ) {}

  public async sync(
    args: GetMessageListsArgs,
  ): Promise<GetMessageListsResponse> {
    return this.getMessageLists(args);
  }

  async getMessageLists({
    connectedAccount,
    messageFolders,
    messageChannel,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const foldersToProcess =
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS
        ? messageFolders.filter((folder) => folder.isSynced)
        : messageFolders;

    if (foldersToProcess.length === 0) {
      this.logger.warn(
        `Connected account ${connectedAccount.id}: No folders to process`,
      );

      return [];
    }

    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      const results: GetMessageListsResponse = [];

      for (const folder of foldersToProcess) {
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
    const folderPath = this.resolveFolderPath(folder);

    if (!isDefined(folderPath)) {
      throw new MessageImportDriverException(
        `Folder ${folder.name} has no path`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    const lock = await client.getMailboxLock(folderPath);

    try {
      const mailbox = client.mailbox;

      if (!mailbox || typeof mailbox === 'boolean') {
        throw new MessageImportDriverException(
          `Invalid mailbox state for folder ${folderPath}`,
          MessageImportDriverExceptionCode.UNKNOWN,
        );
      }

      const lastKnownSequence = this.parseSequenceCursor(folder.syncCursor);
      const highestSequenceInFolder = Number(mailbox.exists ?? 0);
      const safeKnownSequence = Math.min(
        lastKnownSequence,
        highestSequenceInFolder,
      );

      if (lastKnownSequence > highestSequenceInFolder) {
        this.logger.debug(
          `Folder ${folderPath}: cursor ${lastKnownSequence} exceeds current size ${highestSequenceInFolder}; clamping cursor to mailbox size.`,
        );
      }

      const startSequence = safeKnownSequence + 1;
      const messageUids =
        startSequence > highestSequenceInFolder
          ? []
          : await this.fetchMessageUidsBySequence(
              client,
              startSequence,
              highestSequenceInFolder,
            );

      const messageExternalIds = messageUids
        .sort((a, b) => b - a)
        .map((uid) => `${folderPath}:${uid}`);

      return {
        messageExternalIds,
        messageExternalIdsToDelete: [],
        nextSyncCursor: String(highestSequenceInFolder),
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

  private resolveFolderPath(folder: MessageFolder): string | null {
    const parsedExternalId = parseMessageId(folder.externalId ?? '');

    if (isDefined(parsedExternalId?.folder)) {
      return parsedExternalId.folder;
    }

    if (isDefined(folder.externalId) && folder.externalId.trim().length > 0) {
      return folder.externalId;
    }

    return null;
  }

  private parseSequenceCursor(syncCursor: string | null): number {
    if (!isDefined(syncCursor) || syncCursor === '') {
      return 0;
    }

    const parsedCursor = Number.parseInt(syncCursor, 10);

    if (Number.isInteger(parsedCursor) && parsedCursor >= 0) {
      return parsedCursor;
    }

    try {
      const parsed = JSON.parse(syncCursor) as { highestSequence?: number };

      if (
        Number.isInteger(parsed.highestSequence) &&
        parsed.highestSequence >= 0
      ) {
        return parsed.highestSequence;
      }
    } catch {
      // Ignore malformed legacy cursors.
    }

    this.logger.warn(
      `Invalid IMAP sync cursor "${syncCursor}" detected; falling back to a full folder scan.`,
    );

    return 0;
  }

  private async fetchMessageUidsBySequence(
    client: ImapFlow,
    startSequence: number,
    endSequence: number,
  ): Promise<number[]> {
    const sequenceRange = `${startSequence}:${endSequence}`;
    const fetchedMessages = await client.fetchAll(
      sequenceRange,
      {
        uid: true,
      },
      {
        uid: false,
      },
    );

    return fetchedMessages
      .map((message) => message.uid)
      .filter((uid) => Number.isInteger(uid));
  }
}
