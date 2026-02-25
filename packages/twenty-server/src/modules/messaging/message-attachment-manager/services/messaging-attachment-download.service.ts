import { Injectable, NotFoundException } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageAttachmentWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-attachment.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { GmailAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/gmail-attachment-download.service';
import { ImapAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/imap-attachment-download.service';
import { MicrosoftAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/microsoft-attachment-download.service';

type DownloadResult = {
  content: Buffer;
  filename: string;
  mimeType: string;
};

@Injectable()
export class MessagingAttachmentDownloadService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailAttachmentDownloadService: GmailAttachmentDownloadService,
    private readonly microsoftAttachmentDownloadService: MicrosoftAttachmentDownloadService,
    private readonly imapAttachmentDownloadService: ImapAttachmentDownloadService,
  ) {}

  async download(
    messageAttachmentId: string,
    workspaceId: string,
  ): Promise<DownloadResult> {
    const messageAttachmentRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageAttachmentWorkspaceEntity>(
        workspaceId,
        'messageAttachment',
      );

    const messageAttachment = await messageAttachmentRepository.findOne({
      where: { id: messageAttachmentId },
    });

    if (!isDefined(messageAttachment)) {
      throw new NotFoundException('Message attachment not found');
    }

    const messageChannelMessageAssociationRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    const association =
      await messageChannelMessageAssociationRepository.findOne({
        where: { messageId: messageAttachment.messageId },
      });

    if (!isDefined(association)) {
      throw new NotFoundException(
        'Message channel message association not found',
      );
    }

    const messageChannelRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: association.messageChannelId },
    });

    if (!isDefined(messageChannel)) {
      throw new NotFoundException('Message channel not found');
    }

    const connectedAccountRepository =
      await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: { id: messageChannel.connectedAccountId },
    });

    if (!isDefined(connectedAccount)) {
      throw new NotFoundException('Connected account not found');
    }

    const content = await this.downloadFromProvider(
      connectedAccount,
      association.messageExternalId ?? '',
      messageAttachment.externalIdentifier ?? '',
    );

    return {
      content,
      filename: messageAttachment.name,
      mimeType: messageAttachment.mimeType || 'application/octet-stream',
    };
  }

  private async downloadFromProvider(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    externalMessageId: string,
    externalIdentifier: string,
  ): Promise<Buffer> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailAttachmentDownloadService.download(
          connectedAccount,
          externalMessageId,
          externalIdentifier,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftAttachmentDownloadService.download(
          connectedAccount,
          externalMessageId,
          externalIdentifier,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapAttachmentDownloadService.download(
          connectedAccount,
          externalMessageId,
          externalIdentifier,
        );
      default:
        throw new Error(`Unsupported provider: ${connectedAccount.provider}`);
    }
  }
}
