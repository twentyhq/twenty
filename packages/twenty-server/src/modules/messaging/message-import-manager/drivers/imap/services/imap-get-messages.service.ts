import { Injectable, Logger } from '@nestjs/common';

import { type AddressObject, type ParsedMail } from 'mailparser';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { ImapFetchByBatchService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-fetch-by-batch.service';
import { type MessageFetchResult } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-processor.service';
import { ImapMessageTextExtractorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-text-extractor.service';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';
import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
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

  constructor(
    private readonly fetchByBatchService: ImapFetchByBatchService,
    private readonly messageTextExtractor: ImapMessageTextExtractorService,
  ) {}

  async getMessages(
    messageIds: string[],
    connectedAccount: ConnectedAccountType,
  ): Promise<MessageWithParticipants[]> {
    if (!messageIds.length) {
      return [];
    }

    const folderToUidsMap = this.groupMessageIdsByFolder(messageIds);

    const allMessages: MessageWithParticipants[] = [];

    for (const [folder, uids] of folderToUidsMap.entries()) {
      if (!uids.length) {
        continue;
      }

      const { results } = await this.fetchByBatchService.fetchAllByBatches(
        uids,
        connectedAccount,
        folder,
      );

      this.logger.log(`IMAP fetch completed for folder: ${folder}`);

      const messages = this.formatBatchResponseAsMessages(
        results,
        connectedAccount,
        folder,
      );

      allMessages.push(...messages);
    }

    return allMessages;
  }

  private groupMessageIdsByFolder(messageIds: string[]): Map<string, number[]> {
    const folderToUidsMap = new Map<string, number[]>();

    for (const messageId of messageIds) {
      const parsedMessageId = parseMessageId(messageId);

      if (!parsedMessageId) {
        this.logger.warn(`Invalid messageId format: ${messageId}`);
        continue;
      }

      const { folder, uid } = parsedMessageId;

      if (!folderToUidsMap.has(folder)) {
        folderToUidsMap.set(folder, []);
      }
      folderToUidsMap.get(folder)!.push(uid);
    }

    return folderToUidsMap;
  }

  private formatBatchResponseAsMessages(
    batchResults: MessageFetchResult[],
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
    folder: string,
  ): MessageWithParticipants[] {
    const messages = batchResults.map((result) => {
      if (!result.parsed) {
        this.logger.warn(
          `Message UID ${result.uid} could not be parsed - likely not found in current folders`,
        );

        return undefined;
      }

      return this.createMessageFromParsedMail(
        result.parsed,
        result.uid.toString(),
        connectedAccount,
        folder,
      );
    });

    const validMessages = messages.filter(isDefined);

    this.logger.log(
      `Successfully parsed ${validMessages.length} out of ${batchResults.length} messages`,
    );

    return validMessages;
  }

  private createMessageFromParsedMail(
    parsed: ParsedMail,
    uid: string,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
    folder: string,
  ): MessageWithParticipants {
    const participants = this.extractAllParticipants(parsed);
    const attachments = this.extractAttachments(parsed);
    const threadId = this.extractThreadId(parsed);

    const fromAddresses = this.extractAddresses(
      parsed.from as AddressObject | undefined,
      'from',
    );

    const fromHandle = fromAddresses.length > 0 ? fromAddresses[0].address : '';

    const textWithoutReplyQuotations =
      this.messageTextExtractor.extractTextWithoutReplyQuotations(parsed);

    const direction = computeMessageDirection(fromHandle, connectedAccount);
    const text = sanitizeString(textWithoutReplyQuotations);
    const subject = sanitizeString(parsed.subject || '');

    return {
      externalId: `${folder}:${uid}`,
      messageThreadExternalId: threadId || parsed.messageId || uid,
      headerMessageId: parsed.messageId || uid,
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
        return threadRoot;
      }
    }

    if (inReplyTo) {
      const cleanInReplyTo =
        typeof inReplyTo === 'string'
          ? inReplyTo.trim()
          : String(inReplyTo).trim();

      if (cleanInReplyTo && cleanInReplyTo.length > 0) {
        return cleanInReplyTo;
      }
    }

    if (messageId) {
      return messageId.trim();
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 11);

    return `thread-${timestamp}-${randomSuffix}`;
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
