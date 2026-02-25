import { Injectable } from '@nestjs/common';

import { type FetchMessageObject } from 'imapflow';
import PostalMime, { type Attachment } from 'postal-mime';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';

@Injectable()
export class ImapAttachmentDownloadService {
  constructor(private readonly imapClientProvider: ImapClientProvider) {}

  async download(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'handle' | 'handleAliases' | 'connectionParameters'
    >,
    externalMessageId: string,
    externalIdentifier: string,
  ): Promise<Buffer> {
    const parsed = parseMessageId(externalMessageId);

    if (!parsed) {
      throw new Error(
        `Invalid IMAP message external ID format: ${externalMessageId}`,
      );
    }

    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      const lock = await client.getMailboxLock(parsed.folder);

      try {
        const fetchResult = await client.fetchOne(
          String(parsed.uid),
          { source: true },
          { uid: true },
        );

        const message = fetchResult as FetchMessageObject;

        if (!message?.source) {
          throw new Error('Message source not found');
        }

        const parsedMail = await PostalMime.parse(message.source);

        const attachment = this.findAttachment(
          parsedMail.attachments,
          externalIdentifier,
        );

        if (!attachment?.content) {
          throw new Error('Attachment not found in message');
        }

        if (typeof attachment.content === 'string') {
          return Buffer.from(attachment.content, 'base64');
        }

        if (attachment.content instanceof Uint8Array) {
          return Buffer.from(attachment.content);
        }

        return Buffer.from(new Uint8Array(attachment.content));
      } finally {
        lock.release();
      }
    } finally {
      await this.imapClientProvider.closeClient(client);
    }
  }

  private findAttachment(
    attachments: Attachment[],
    externalIdentifier: string,
  ): Attachment | undefined {
    if (externalIdentifier.startsWith('index:')) {
      const index = parseInt(externalIdentifier.slice(6), 10);

      return attachments[index];
    }

    return attachments.find(
      (attachment) => attachment.contentId === externalIdentifier,
    );
  }
}
