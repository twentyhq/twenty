import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { findSentMailbox } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/find-sent-mailbox.util';
import { GetFullMessageListResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

@Injectable()
export class ImapGetMessageListService {
  private readonly logger = new Logger(ImapGetMessageListService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapHandleErrorService: ImapHandleErrorService,
  ) {}

  async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
  ): Promise<GetFullMessageListResponse> {
    try {
      const client = await this.imapClientProvider.getClient(connectedAccount);

      const mailboxes = ['INBOX'];

      const sentFolder = await findSentMailbox(client, this.logger);

      if (sentFolder) {
        mailboxes.push(sentFolder);
      }

      let allMessages: { id: string; date: string }[] = [];

      for (const mailbox of mailboxes) {
        try {
          const messages = await this.getMessagesFromMailbox(client, mailbox);

          allMessages = [...allMessages, ...messages];
          this.logger.log(
            `Fetched ${messages.length} messages from ${mailbox}`,
          );
        } catch (error) {
          this.logger.warn(
            `Error fetching from mailbox ${mailbox}: ${error.message}. Continuing with other mailboxes.`,
          );
        }
      }

      allMessages.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      const messageExternalIds = allMessages.map((message) => message.id);

      const nextSyncCursor =
        allMessages.length > 0 ? allMessages[allMessages.length - 1].date : '';

      return {
        messageExternalIds,
        nextSyncCursor,
      };
    } catch (error) {
      this.logger.error(
        `Error getting message list: ${error.message}`,
        error.stack,
      );

      this.imapHandleErrorService.handleImapMessageListFetchError(error);

      return { messageExternalIds: [], nextSyncCursor: '' };
    } finally {
      await this.imapClientProvider.closeClient(connectedAccount.id);
    }
  }

  async getPartialMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
    syncCursor?: string,
  ): Promise<{ messageExternalIds: string[]; nextSyncCursor: string }> {
    try {
      const client = await this.imapClientProvider.getClient(connectedAccount);

      const mailboxes = ['INBOX'];

      const sentFolder = await findSentMailbox(client, this.logger);

      if (sentFolder) {
        mailboxes.push(sentFolder);
      }

      let allMessages: { id: string; date: string }[] = [];

      for (const mailbox of mailboxes) {
        try {
          const messages = await this.getMessagesFromMailbox(
            client,
            mailbox,
            syncCursor,
          );

          allMessages = [...allMessages, ...messages];
          this.logger.log(
            `Fetched ${messages.length} messages from ${mailbox}`,
          );
        } catch (error) {
          this.logger.warn(
            `Error fetching from mailbox ${mailbox}: ${error.message}. Continuing with other mailboxes.`,
          );
        }
      }

      allMessages.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      const messageExternalIds = allMessages.map((message) => message.id);

      const nextSyncCursor =
        allMessages.length > 0
          ? allMessages[allMessages.length - 1].date
          : syncCursor || '';

      return {
        messageExternalIds,
        nextSyncCursor,
      };
    } catch (error) {
      this.logger.error(
        `Error getting message list: ${error.message}`,
        error.stack,
      );

      this.imapHandleErrorService.handleImapMessageListFetchError(error);

      return { messageExternalIds: [], nextSyncCursor: syncCursor || '' };
    } finally {
      await this.imapClientProvider.closeClient(connectedAccount.id);
    }
  }

  private async getMessagesFromMailbox(
    client: ImapFlow,
    mailbox: string,
    cursor?: string,
  ): Promise<{ id: string; date: string }[]> {
    let lock;

    try {
      lock = await client.getMailboxLock(mailbox);

      let searchOptions = {};

      if (cursor) {
        searchOptions = {
          since: new Date(cursor),
        };
      }

      const messages: { id: string; date: string }[] = [];

      for await (const message of client.fetch(searchOptions, {
        envelope: true,
      })) {
        if (message.envelope?.messageId) {
          const messageDate = message.envelope.date
            ? new Date(message.envelope.date)
            : new Date();
          const validDate = isNaN(messageDate.getTime())
            ? new Date()
            : messageDate;

          messages.push({
            id: message.envelope.messageId,
            date: validDate.toISOString(),
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
