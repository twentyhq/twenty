import { Injectable, Logger } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import planer from 'planer';
import addressparser from 'addressparser';
import { gmail_v1 } from 'googleapis';

import { assert, assertNotNull } from 'src/utils/assert';
import { GmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { formatAddressObjectAsParticipants } from 'src/modules/messaging/message-import-manager/utils/format-address-object-as-participants.util';
import { MessagingFetchByBatchesService } from 'src/modules/messaging/common/services/messaging-fetch-by-batch.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class MessagingGmailFetchMessagesByBatchesService {
  private readonly logger = new Logger(
    MessagingGmailFetchMessagesByBatchesService.name,
  );

  constructor(
    private readonly fetchByBatchesService: MessagingFetchByBatchesService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  async fetchAllMessages(
    messageIds: string[],
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<GmailMessage[]> {
    let startTime = Date.now();

    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const accessToken = connectedAccount.accessToken;

    const { messageIdsByBatch, batchResponses } =
      await this.fetchByBatchesService.fetchAllByBatches(
        messageIds,
        accessToken,
        'batch_gmail_messages',
      );
    let endTime = Date.now();

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} fetching ${
        messageIds.length
      } messages in ${endTime - startTime}ms`,
    );

    startTime = Date.now();

    const formattedResponse = this.formatBatchResponsesAsGmailMessages(
      messageIdsByBatch,
      batchResponses,
      workspaceId,
      connectedAccountId,
    );

    endTime = Date.now();

    this.logger.log(
      `Messaging import for workspace ${workspaceId} and account ${connectedAccountId} formatting ${
        messageIds.length
      } messages in ${endTime - startTime}ms`,
    );

    return formattedResponse;
  }

  private formatBatchResponseAsGmailMessage(
    messageIds: string[],
    responseCollection: AxiosResponse<any, any>,
    workspaceId: string,
    connectedAccountId: string,
  ): GmailMessage[] {
    const parsedResponses =
      this.fetchByBatchesService.parseBatch(responseCollection);

    const sanitizeString = (str: string) => {
      return str.replace(/\0/g, '');
    };

    const formattedResponse = parsedResponses.map((response, index) => {
      if ('error' in response) {
        if (response.error.code === 404) {
          return null;
        }

        throw { ...response.error, messageId: messageIds[index] };
      }

      const {
        historyId,
        id,
        threadId,
        internalDate,
        subject,
        from,
        to,
        cc,
        bcc,
        headerMessageId,
        text,
        attachments,
        deliveredTo,
      } = this.parseGmailMessage(response);

      if (!from) {
        this.logger.log(
          `From value is missing while importing message #${id} in workspace ${workspaceId} and account ${connectedAccountId}`,
        );

        return null;
      }

      if (!to && !deliveredTo && !bcc && !cc) {
        this.logger.log(
          `To, Delivered-To, Bcc or Cc value is missing while importing message #${id} in workspace ${workspaceId} and account ${connectedAccountId}`,
        );

        return null;
      }

      if (!headerMessageId) {
        this.logger.log(
          `Message-ID is missing while importing message #${id} in workspace ${workspaceId} and account ${connectedAccountId}`,
        );

        return null;
      }

      if (!threadId) {
        this.logger.log(
          `Thread Id is missing while importing message #${id} in workspace ${workspaceId} and account ${connectedAccountId}`,
        );

        return null;
      }

      const participants = [
        ...formatAddressObjectAsParticipants(from, 'from'),
        ...formatAddressObjectAsParticipants(to ?? deliveredTo, 'to'),
        ...formatAddressObjectAsParticipants(cc, 'cc'),
        ...formatAddressObjectAsParticipants(bcc, 'bcc'),
      ];

      let textWithoutReplyQuotations = text;

      if (text) {
        textWithoutReplyQuotations = planer.extractFrom(text, 'text/plain');
      }

      const messageFromGmail: GmailMessage = {
        historyId,
        externalId: id,
        headerMessageId,
        subject: subject || '',
        messageThreadExternalId: threadId,
        internalDate,
        fromHandle: from[0].address || '',
        fromDisplayName: from[0].name || '',
        participants,
        text: sanitizeString(textWithoutReplyQuotations || ''),
        attachments,
      };

      return messageFromGmail;
    });

    const filteredMessages = formattedResponse.filter((message) =>
      assertNotNull(message),
    ) as GmailMessage[];

    return filteredMessages;
  }

  private formatBatchResponsesAsGmailMessages(
    messageIdsByBatch: string[][],
    batchResponses: AxiosResponse<any, any>[],
    workspaceId: string,
    connectedAccountId: string,
  ): GmailMessage[] {
    const messageBatches = batchResponses.map((response, index) => {
      return this.formatBatchResponseAsGmailMessage(
        messageIdsByBatch[index],
        response,
        workspaceId,
        connectedAccountId,
      );
    });

    return messageBatches.flat();
  }

  private parseGmailMessage(message: gmail_v1.Schema$Message) {
    const subject = this.getPropertyFromHeaders(message, 'Subject');
    const rawFrom = this.getPropertyFromHeaders(message, 'From');
    const rawTo = this.getPropertyFromHeaders(message, 'To');
    const rawDeliveredTo = this.getPropertyFromHeaders(message, 'Delivered-To');
    const rawCc = this.getPropertyFromHeaders(message, 'Cc');
    const rawBcc = this.getPropertyFromHeaders(message, 'Bcc');
    const messageId = this.getPropertyFromHeaders(message, 'Message-ID');
    const id = message.id;
    const threadId = message.threadId;
    const historyId = message.historyId;
    const internalDate = message.internalDate;

    assert(id, 'ID is missing');
    assert(historyId, 'History-ID is missing');
    assert(internalDate, 'Internal date is missing');

    const bodyData = this.getBodyData(message);
    const text = bodyData ? Buffer.from(bodyData, 'base64').toString() : '';

    const attachments = this.getAttachmentData(message);

    return {
      id,
      headerMessageId: messageId,
      threadId,
      historyId,
      internalDate,
      subject,
      from: rawFrom ? addressparser(rawFrom) : undefined,
      deliveredTo: rawDeliveredTo ? addressparser(rawDeliveredTo) : undefined,
      to: rawTo ? addressparser(rawTo) : undefined,
      cc: rawCc ? addressparser(rawCc) : undefined,
      bcc: rawBcc ? addressparser(rawBcc) : undefined,
      text,
      attachments,
    };
  }

  private getBodyData(message: gmail_v1.Schema$Message) {
    const firstPart = message.payload?.parts?.[0];

    if (firstPart?.mimeType === 'text/plain') {
      return firstPart?.body?.data;
    }

    return firstPart?.parts?.find((part) => part.mimeType === 'text/plain')
      ?.body?.data;
  }

  private getAttachmentData(message: gmail_v1.Schema$Message) {
    return (
      message.payload?.parts
        ?.filter((part) => part.filename && part.body?.attachmentId)
        .map((part) => ({
          filename: part.filename || '',
          id: part.body?.attachmentId || '',
          mimeType: part.mimeType || '',
          size: part.body?.size || 0,
        })) || []
    );
  }

  private getPropertyFromHeaders(
    message: gmail_v1.Schema$Message,
    property: string,
  ) {
    const header = message.payload?.headers?.find(
      (header) => header.name?.toLowerCase() === property.toLowerCase(),
    );

    return header?.value;
  }
}
