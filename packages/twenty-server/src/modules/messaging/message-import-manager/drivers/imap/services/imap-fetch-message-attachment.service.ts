import { Injectable } from '@nestjs/common';

import { type ImapFlow, type MailboxLockObject } from 'imapflow';
import { finished, type Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { isImapMailboxNotFoundError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-mailbox-not-found-error.util';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';
import { type MessageAttachmentDriver } from 'src/modules/messaging/message-import-manager/interfaces/message-attachment-driver.interface';
import { type FetchMessageAttachmentParams } from 'src/modules/messaging/message-import-manager/types/fetch-message-attachment-params.type';

@Injectable()
export class ImapFetchMessageAttachmentService implements MessageAttachmentDriver {
  constructor(private readonly imapClientProvider: ImapClientProvider) {}

  async fetchMessageAttachment({
    connectedAccountId,
    messageExternalId,
    attachmentExternalId,
  }: FetchMessageAttachmentParams): Promise<Readable | null> {
    const parsedMessageId = parseMessageId(messageExternalId);

    if (!isDefined(parsedMessageId)) {
      return null;
    }

    const client = await this.imapClientProvider.getClient(connectedAccountId);

    const mailboxLock = await client
      .getMailboxLock(parsedMessageId.folder)
      .catch(async (error: Error) => {
        await this.imapClientProvider.closeClient(client);

        if (isImapMailboxNotFoundError(error)) {
          return null;
        }

        throw error;
      });

    if (!isDefined(mailboxLock)) {
      return null;
    }

    const { content } = await client
      .download(String(parsedMessageId.uid), attachmentExternalId, {
        uid: true,
      })
      .catch(async (error: Error) => {
        await this.releaseConnection({ client, mailboxLock });

        throw error;
      });

    if (!isDefined(content)) {
      await this.releaseConnection({ client, mailboxLock });

      return null;
    }

    finished(content, () => {
      void this.releaseConnection({ client, mailboxLock });
    });

    return content;
  }

  private async releaseConnection({
    client,
    mailboxLock,
  }: {
    client: ImapFlow;
    mailboxLock: MailboxLockObject;
  }): Promise<void> {
    mailboxLock.release();
    await this.imapClientProvider.closeClient(client);
  }
}
