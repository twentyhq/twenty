import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import MailComposer from 'nodemailer/lib/mail-composer';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type MessageOutboundDriver } from 'src/modules/messaging/message-outbound-manager/interfaces/message-outbound-driver.interface';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';
import { ImapFindDraftsFolderService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-find-drafts-folder.service';
import { getImapFolderPath } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-imap-folder-path.util';
import { SmtpClientProvider } from 'src/modules/messaging/message-import-manager/drivers/smtp/providers/smtp-client.provider';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { extractMessageIdFromBuffer } from 'src/modules/messaging/message-outbound-manager/utils/extract-message-id-from-buffer.util';
import { toMailComposerOptions } from 'src/modules/messaging/message-outbound-manager/utils/to-mail-composer-options.util';

@Injectable()
export class ImapSmtpMessageOutboundService implements MessageOutboundDriver {
  constructor(
    private readonly smtpClientProvider: SmtpClientProvider,
    private readonly imapClientProvider: ImapClientProvider,
    private readonly imapFindDraftsFolderService: ImapFindDraftsFolderService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    const { handle, connectionParameters } = connectedAccount;

    const smtpClient =
      await this.smtpClientProvider.getSmtpClient(connectedAccount);

    this.assertHandleIsDefined(handle);

    const messageBuffer = await this.compileRawMessage(
      handle,
      sendMessageInput,
    );

    await smtpClient.sendMail({
      from: handle,
      to: sendMessageInput.to,
      cc: sendMessageInput.cc,
      bcc: sendMessageInput.bcc,
      raw: messageBuffer,
    });

    if (isDefined(connectionParameters?.IMAP)) {
      const imapClient =
        await this.imapClientProvider.getClient(connectedAccount);

      const messageChannel = await this.messageChannelRepository.findOne({
        where: {
          connectedAccountId: connectedAccount.id,
          handle: handle,
        },
      });

      let sentFolder: MessageFolderEntity | null = null;

      if (isDefined(messageChannel)) {
        sentFolder = await this.messageFolderRepository.findOne({
          where: {
            messageChannelId: messageChannel.id,
            isSentFolder: true,
          },
        });
      }

      const sentFolderPath = getImapFolderPath(sentFolder?.externalId);

      if (isDefined(sentFolderPath)) {
        await imapClient.append(sentFolderPath, messageBuffer);
      }

      await this.imapClientProvider.closeClient(imapClient);
    }

    return {
      headerMessageId: extractMessageIdFromBuffer(messageBuffer),
    };
  }

  async createDraft(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<void> {
    const { handle, connectionParameters } = connectedAccount;

    this.assertHandleIsDefined(handle);

    if (!isDefined(connectionParameters?.IMAP)) {
      throw new Error('IMAP connection is required to create drafts');
    }

    const messageBuffer = await this.compileRawMessage(
      handle,
      sendMessageInput,
    );

    const imapClient =
      await this.imapClientProvider.getClient(connectedAccount);

    try {
      const draftsFolder =
        await this.imapFindDraftsFolderService.findOrCreateDraftsFolder(
          imapClient,
        );

      if (!isDefined(draftsFolder)) {
        throw new Error('No drafts folder found and could not create one');
      }
      const DRAFT_FLAG = '\\Draft';

      await imapClient.append(draftsFolder.path, messageBuffer, [DRAFT_FLAG]);
    } finally {
      await this.imapClientProvider.closeClient(imapClient);
    }
  }

  private async compileRawMessage(
    from: string,
    sendMessageInput: SendMessageInput,
  ): Promise<Buffer> {
    const mail = new MailComposer(
      toMailComposerOptions(from, sendMessageInput),
    );

    return mail.compile().build();
  }

  private assertHandleIsDefined(
    handle: string | null,
  ): asserts handle is string {
    if (!isDefined(handle)) {
      throw new Error('Handle is required');
    }
  }
}
