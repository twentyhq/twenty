import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { Address, type Email as ParsedMail } from 'postal-mime';
import { MessageParticipantRole } from 'twenty-shared/types';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';
import { ImapMessageTextExtractorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-text-extractor.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';
import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

type ConnectedAccount = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'handle' | 'handleAliases' | 'connectionParameters'
>;

@Injectable()
export class ImapGetMessagesService {
  private readonly logger = new Logger(ImapGetMessagesService.name);

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly messageParser: ImapMessageParserService,
    private readonly textExtractor: ImapMessageTextExtractorService,
    private readonly errorHandler: ImapMessagesImportErrorHandler,
  ) {}

  async getMessages(
    messageExternalIds: string[],
    connectedAccount: ConnectedAccount,
  ): Promise<MessageWithParticipants[]> {
    if (!messageExternalIds.length) {
      return [];
    }

    const messagesByFolder = this.groupByFolder(messageExternalIds);
    const client = await this.imapClientProvider.getClient(connectedAccount);

    try {
      const messages = await this.fetchFromAllFolders(
        messagesByFolder,
        client,
        connectedAccount,
      );

      return messages;
    } finally {
      await this.imapClientProvider.closeClient(client);
    }
  }

  private groupByFolder(messageExternalIds: string[]): Map<string, number[]> {
    const messagesByFolder = new Map<string, number[]>();

    for (const externalId of messageExternalIds) {
      const parsed = parseMessageId(externalId);

      if (!parsed) {
        this.logger.warn(`Invalid message external ID format: ${externalId}`);
        continue;
      }

      const uids = messagesByFolder.get(parsed.folder) ?? [];

      uids.push(parsed.uid);
      messagesByFolder.set(parsed.folder, uids);
    }

    return messagesByFolder;
  }

  private async fetchFromAllFolders(
    messagesByFolder: Map<string, number[]>,
    client: ImapFlow,
    connectedAccount: ConnectedAccount,
  ): Promise<MessageWithParticipants[]> {
    const allMessages: MessageWithParticipants[] = [];

    for (const [folderPath, messageUids] of messagesByFolder) {
      if (!messageUids.length) {
        continue;
      }

      const folderMessages = await this.fetchFromFolder(
        folderPath,
        messageUids,
        client,
        connectedAccount,
      );

      allMessages.push(...folderMessages);
    }

    return allMessages;
  }

  private async fetchFromFolder(
    folderPath: string,
    messageUids: number[],
    client: ImapFlow,
    connectedAccount: ConnectedAccount,
  ): Promise<MessageWithParticipants[]> {
    this.logger.log(
      `Fetching ${messageUids.length} messages from ${folderPath}`,
    );
    const startTime = Date.now();

    const results = await this.messageParser.parseMessagesFromFolder(
      messageUids,
      folderPath,
      client,
    );

    const messages: MessageWithParticipants[] = [];

    for (const result of results) {
      if (result.error) {
        this.errorHandler.handleError(
          result.error,
          `${folderPath}:${result.uid}`,
        );
        continue;
      }

      if (!result.parsed) {
        this.logger.warn(
          `Message UID ${result.uid} could not be parsed - likely deleted`,
        );
        continue;
      }

      messages.push(
        this.buildMessage(
          result.parsed,
          result.uid,
          folderPath,
          connectedAccount,
        ),
      );
    }

    this.logger.log(
      `Parsed ${messages.length}/${results.length} messages from ${folderPath} in ${Date.now() - startTime}ms`,
    );

    return messages;
  }

  private buildMessage(
    parsed: ParsedMail,
    uid: number,
    folderPath: string,
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'handle' | 'handleAliases'
    >,
  ): MessageWithParticipants {
    const fromAddresses = this.extractAddresses(parsed.from);
    const senderAddress = fromAddresses[0]?.address ?? '';

    const text = sanitizeString(
      this.textExtractor.extractTextWithoutReplyQuotations(parsed),
    );

    return {
      externalId: `${folderPath}:${uid}`,
      messageThreadExternalId: this.extractThreadId(parsed),
      headerMessageId: parsed.messageId || String(uid),
      subject: sanitizeString(parsed.subject || ''),
      text,
      receivedAt: parsed.date ? new Date(parsed.date) : null,
      direction: computeMessageDirection(senderAddress, connectedAccount),
      attachments: this.extractAttachments(parsed),
      participants: this.extractParticipants(parsed),
    };
  }

  private extractThreadId(parsed: ParsedMail): string {
    if (Array.isArray(parsed.references) && parsed.references[0]?.trim()) {
      return parsed.references[0].trim();
    }

    if (parsed.inReplyTo) {
      const inReplyTo = String(parsed.inReplyTo).trim();

      if (inReplyTo) {
        return inReplyTo;
      }
    }

    if (parsed.messageId?.trim()) {
      return parsed.messageId.trim();
    }

    return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private extractParticipants(parsed: ParsedMail) {
    const addressFields = [
      { field: parsed.from, role: MessageParticipantRole.FROM },
      { field: parsed.to, role: MessageParticipantRole.TO },
      { field: parsed.cc, role: MessageParticipantRole.CC },
      { field: parsed.bcc, role: MessageParticipantRole.BCC },
    ] as const;

    return addressFields.flatMap(({ field, role }) =>
      formatAddressObjectAsParticipants(this.extractAddresses(field), role),
    );
  }

  private extractAddresses(
    address: Address | Address[] | undefined,
  ): EmailAddress[] {
    if (!address) {
      return [];
    }

    const addresses = Array.isArray(address) ? address : [address];

    const mailboxes = addresses.flatMap((addr) =>
      addr.address ? [addr] : (addr.group ?? []),
    );

    return mailboxes
      .filter((mailbox) => mailbox.address)
      .map((mailbox) => ({
        address: mailbox.address,
        name: sanitizeString(mailbox.name || ''),
      }));
  }

  private extractAttachments(parsed: ParsedMail) {
    return (parsed.attachments || []).map((attachment) => ({
      filename: attachment.filename || 'unnamed-attachment',
    }));
  }
}
