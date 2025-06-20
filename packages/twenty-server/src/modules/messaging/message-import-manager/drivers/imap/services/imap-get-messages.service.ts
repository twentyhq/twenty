import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { AddressObject, ParsedMail, simpleParser } from 'mailparser';
// @ts-expect-error legacy noImplicitAny
import planer from 'planer';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-handle-error.service';
import { findSentMailbox } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/find-sent-mailbox.util';
import { EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

type AddressType = 'from' | 'to' | 'cc' | 'bcc';

@Injectable()
export class ImapGetMessagesService {
  private readonly logger = new Logger(ImapGetMessagesService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapHandleErrorService: ImapHandleErrorService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'handle' | 'handleAliases'
    > & {
      connectionParameters: Record<string, unknown> | null;
    },
  ): Promise<MessageWithParticipants[]> {
    if (!messageIds.length) {
      return [];
    }

    try {
      const client = await this.imapClientProvider.getClient(connectedAccount);

      const messages: MessageWithParticipants[] = [];

      const mailboxes = ['INBOX'];

      const sentFolder = await findSentMailbox(client, this.logger);

      if (sentFolder) {
        mailboxes.push(sentFolder);
      }

      for (const mailbox of mailboxes) {
        try {
          const lock = await client.getMailboxLock(mailbox);

          try {
            for (const messageId of messageIds) {
              try {
                const existingMessage = messages.find(
                  (m) => m.externalId === messageId,
                );

                if (existingMessage) {
                  continue;
                }

                const message = await this.fetchAndParseMessage(
                  messageId,
                  client,
                  connectedAccount,
                );

                if (message) {
                  messages.push(message);
                  this.logger.log(
                    `Found message ${messageId} in mailbox ${mailbox}`,
                  );
                }
              } catch (messageError) {
                this.handleSingleMessageError(messageError, messageId);
              }
            }
          } finally {
            lock.release();
          }
        } catch (error) {
          this.logger.warn(
            `Error accessing mailbox ${mailbox}: ${error.message}. Continuing with other mailboxes.`,
          );
        }
      }

      return messages;
    } catch (error) {
      this.logger.error(
        `Error getting messages: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await this.imapClientProvider.closeClient(connectedAccount.id);
    }
  }

  private async fetchAndParseMessage(
    messageId: string,
    client: ImapFlow,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): Promise<MessageWithParticipants | null> {
    const results = await client.search({
      header: {
        'message-id': messageId,
      },
    });

    if (!results.length) {
      this.logger.debug(
        `Message with ID ${messageId} not found in current mailbox`,
      );

      return null;
    }

    const seq = results[0];
    const fetchResult = await client.fetchOne(seq.toString(), {
      source: true,
      envelope: true,
    });

    if (!fetchResult) {
      this.logger.debug(`Failed to fetch message with ID ${messageId}`);

      return null;
    }

    const rawContent = fetchResult.source?.toString() || '';
    const parsed = await simpleParser(rawContent);

    return this.createMessageFromParsedMail(
      parsed,
      messageId,
      connectedAccount,
    );
  }

  private createMessageFromParsedMail(
    parsed: ParsedMail,
    messageId: string,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): MessageWithParticipants {
    const participants = this.extractAllParticipants(parsed);
    const attachments = this.extractAttachments(parsed);

    const threadId = this.extractThreadId(parsed);

    const fromAddresses = this.extractAddresses(
      parsed.from as AddressObject | undefined,
      'from',
    );

    const fromHandle = fromAddresses.length > 0 ? fromAddresses[0].address : '';

    const textWithoutReplyQuotations = parsed.text
      ? planer.extractFrom(parsed.text, 'text/plain')
      : '';

    const direction = computeMessageDirection(fromHandle, connectedAccount);
    const text = sanitizeString(textWithoutReplyQuotations);

    return {
      externalId: messageId,
      messageThreadExternalId: threadId || messageId,
      headerMessageId: parsed.messageId || messageId,
      subject: parsed.subject || '',
      text: text,
      receivedAt: parsed.date || new Date(),
      direction: direction,
      attachments,
      participants,
    };
  }

  private extractThreadId(parsed: ParsedMail): string | null {
    const references = parsed.references;

    if (references && references.length > 0) {
      return references[0];
    }

    const inReplyTo = parsed.inReplyTo;

    if (inReplyTo) {
      return inReplyTo;
    }

    return parsed.messageId || null;
  }

  private extractAllParticipants(parsed: ParsedMail) {
    const fromAddresses = this.extractAddresses(
      parsed.from as AddressObject | undefined,
      'from',
    );
    const toAddresses = this.extractAddresses(
      parsed.to as AddressObject | undefined,
      'to',
    );
    const ccAddresses = this.extractAddresses(
      parsed.cc as AddressObject | undefined,
      'cc',
    );
    const bccAddresses = this.extractAddresses(
      parsed.bcc as AddressObject | undefined,
      'bcc',
    );

    return [
      ...formatAddressObjectAsParticipants(fromAddresses, 'from'),
      ...formatAddressObjectAsParticipants(toAddresses, 'to'),
      ...formatAddressObjectAsParticipants(ccAddresses, 'cc'),
      ...formatAddressObjectAsParticipants(bccAddresses, 'bcc'),
    ];
  }

  private extractAddresses(
    addressObject: AddressObject | undefined,
    _type: AddressType,
  ): EmailAddress[] {
    const addresses: EmailAddress[] = [];

    if (addressObject && 'value' in addressObject) {
      for (const addr of addressObject.value) {
        if (addr.address) {
          addresses.push({
            address: addr.address,
            name: addr.name || '',
          });
        }
      }
    }

    return addresses;
  }

  private extractAttachments(parsed: ParsedMail) {
    return (parsed.attachments || []).map((attachment) => ({
      filename: attachment.filename || 'unnamed-attachment',
    }));
  }

  private handleSingleMessageError(error: Error, messageId: string): void {
    this.logger.error(
      `Error fetching message ${messageId}: ${error.message}`,
      error.stack,
    );
    this.imapHandleErrorService.handleImapMessagesImportError(error, messageId);
  }
}
