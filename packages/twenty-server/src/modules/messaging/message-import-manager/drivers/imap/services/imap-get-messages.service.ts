import { Injectable, Logger } from '@nestjs/common';

import { AddressObject, ParsedMail } from 'mailparser';
// @ts-expect-error legacy noImplicitAny
import planer from 'planer';
import { isDefined } from 'twenty-shared/utils';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { ImapFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-fetch-by-batch.service';
import { MessageFetchResult } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';
import { EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

type AddressType = 'from' | 'to' | 'cc' | 'bcc';

type ConnectedAccountType = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'handle' | 'handleAliases' | 'connectionParameters'
>;

@Injectable()
export class ImapGetMessagesService {
  private readonly logger = new Logger(ImapGetMessagesService.name);

  constructor(private readonly fetchByBatchService: ImapFetchByBatchService) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: ConnectedAccountType,
  ): Promise<MessageWithParticipants[]> {
    if (!messageIds.length) {
      return [];
    }

    const { batchResults } = await this.fetchByBatchService.fetchAllByBatches(
      messageIds,
      connectedAccount,
    );

    this.logger.log(`IMAP fetch completed`);

    const messages = this.formatBatchResponsesAsMessages(
      batchResults,
      connectedAccount,
    );

    return messages;
  }

  public formatBatchResponsesAsMessages(
    batchResults: MessageFetchResult[][],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): MessageWithParticipants[] {
    return batchResults.flatMap((batchResult) => {
      return this.formatBatchResponseAsMessages(batchResult, connectedAccount);
    });
  }

  private formatBatchResponseAsMessages(
    batchResults: MessageFetchResult[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): MessageWithParticipants[] {
    const messages = batchResults.map((result) => {
      if (!result.parsed) {
        this.logger.debug(
          `Message ${result.messageId} could not be parsed - likely not found in current mailboxes`,
        );

        return undefined;
      }

      return this.createMessageFromParsedMail(
        result.parsed,
        result.messageId,
        connectedAccount,
      );
    });

    return messages.filter(isDefined);
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
    const subject = sanitizeString(parsed.subject || '');

    return {
      externalId: messageId,
      messageThreadExternalId: threadId || messageId,
      headerMessageId: parsed.messageId || messageId,
      subject: subject,
      text: text,
      receivedAt: parsed.date || new Date(),
      direction: direction,
      attachments,
      participants,
    };
  }

  private extractThreadId(parsed: ParsedMail): string | null {
    const { messageId, references, inReplyTo } = parsed;

    if (references && Array.isArray(references) && references.length > 0) {
      const threadRoot = references[0].trim();

      if (threadRoot && threadRoot.length > 0) {
        return this.normalizeMessageId(threadRoot);
      }
    }

    if (inReplyTo) {
      const cleanInReplyTo =
        typeof inReplyTo === 'string'
          ? inReplyTo.trim()
          : String(inReplyTo).trim();

      if (cleanInReplyTo && cleanInReplyTo.length > 0) {
        return this.normalizeMessageId(cleanInReplyTo);
      }
    }

    if (messageId) {
      return this.normalizeMessageId(messageId);
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 11);

    return `thread-${timestamp}-${randomSuffix}`;
  }

  private normalizeMessageId(messageId: string): string {
    const trimmedMessageId = messageId.trim();

    if (
      trimmedMessageId.includes('@') &&
      !trimmedMessageId.startsWith('<') &&
      !trimmedMessageId.endsWith('>')
    ) {
      return `<${trimmedMessageId}>`;
    }

    return trimmedMessageId;
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
          const name = sanitizeString(addr.name);

          addresses.push({
            address: addr.address,
            name: name,
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
}
