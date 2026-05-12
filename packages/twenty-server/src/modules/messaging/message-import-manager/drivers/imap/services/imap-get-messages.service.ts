import { Injectable, Logger } from '@nestjs/common';

import { type ImapFlow } from 'imapflow';
import { type Email as ParsedMail } from 'postal-mime';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { computeMessageDirection } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/compute-message-direction.util';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapMessageParserService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-parser.service';
import { ImapMessageTextExtractorService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-message-text-extractor.service';
import { ImapMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-messages-import-error-handler.service';
import { parseMessageId } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-message-id.util';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import { extractAddressesFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-addresses-from-parsed-email.util';
import { extractParticipantsFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-participants-from-parsed-email.util';
import { extractThreadIdFromParsedEmail } from 'src/modules/messaging/message-import-manager/utils/extract-thread-id-from-parsed-email.util';
import { sanitizeString } from 'src/modules/messaging/message-import-manager/utils/sanitize-string.util';

type ConnectedAccount = Pick<
  ConnectedAccountEntity,
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
      return await this.fetchFromAllFolders(
        messagesByFolder,
        client,
        connectedAccount,
      );
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
    this.logger.debug(
      `Fetching ${messageUids.length} messages from ${folderPath}`,
    );
    const startTime = Date.now();

    const { messages: results, uidValidity } =
      await this.messageParser.parseMessagesFromFolder(
        messageUids,
        folderPath,
        client,
      );

    const folderExternalId = uidValidity
      ? `${folderPath}:${uidValidity}`
      : folderPath;

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
          folderExternalId,
          connectedAccount,
        ),
      );
    }

    this.logger.debug(
      `Parsed ${messages.length}/${results.length} messages from ${folderPath} in ${Date.now() - startTime}ms`,
    );

    return messages;
  }

  private buildMessage(
    parsed: ParsedMail,
    uid: number,
    folderPath: string,
    folderExternalId: string,
    connectedAccount: Pick<ConnectedAccountEntity, 'handle' | 'handleAliases'>,
  ): MessageWithParticipants {
    const fromAddresses = extractAddressesFromParsedEmail(parsed.from);
    const senderAddress = fromAddresses[0]?.address ?? '';

    const text = sanitizeString(
      this.textExtractor.extractTextWithoutReplyQuotations(parsed),
    );

    return {
      externalId: `${folderPath}:${uid}`,
      messageThreadExternalId: extractThreadIdFromParsedEmail(parsed),
      headerMessageId: parsed.messageId || String(uid),
      subject: sanitizeString(parsed.subject || ''),
      text,
      receivedAt: parsed.date ? new Date(parsed.date) : null,
      direction: computeMessageDirection(senderAddress, connectedAccount),
      attachments: (parsed.attachments || []).map((attachment) => ({
        filename: attachment.filename || 'unnamed-attachment',
      })),
      participants: extractParticipantsFromParsedEmail(parsed),
      messageFolderExternalIds: [folderExternalId],
    };
  }
}
