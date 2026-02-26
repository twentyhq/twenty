import {
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';

import { Readable } from 'stream';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageAttachmentWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-attachment.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGE_ATTACHMENT_MAX_DOWNLOAD_SIZE_BYTES } from 'src/modules/messaging/message-attachment-manager/constants/message-attachment-download.constant';
import { GmailAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/gmail-attachment-download.service';
import { ImapAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/imap-attachment-download.service';
import { MicrosoftAttachmentDownloadService } from 'src/modules/messaging/message-attachment-manager/drivers/microsoft-attachment-download.service';

const ATTACHMENT_DOWNLOAD_MAX_REQUESTS = 50;
const ATTACHMENT_DOWNLOAD_TIME_WINDOW_MS = 60_000;

type DownloadResult = {
  stream: Readable;
  filename: string;
  mimeType: string;
  size: number | null;
};

@Injectable()
export class MessagingAttachmentDownloadService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly gmailAttachmentDownloadService: GmailAttachmentDownloadService,
    private readonly microsoftAttachmentDownloadService: MicrosoftAttachmentDownloadService,
    private readonly imapAttachmentDownloadService: ImapAttachmentDownloadService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  async download(
    messageAttachmentId: string,
    workspaceId: string,
  ): Promise<DownloadResult> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `attachment-download:throttler:${workspaceId}`,
      1,
      ATTACHMENT_DOWNLOAD_MAX_REQUESTS,
      ATTACHMENT_DOWNLOAD_TIME_WINDOW_MS,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
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

        if (
          isDefined(messageAttachment.size) &&
          messageAttachment.size > MESSAGE_ATTACHMENT_MAX_DOWNLOAD_SIZE_BYTES
        ) {
          throw new PayloadTooLargeException(
            `Attachment size (${messageAttachment.size} bytes) exceeds maximum allowed size (${MESSAGE_ATTACHMENT_MAX_DOWNLOAD_SIZE_BYTES} bytes)`,
          );
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

        const stream = Readable.from(content);

        return {
          stream,
          filename: messageAttachment.name,
          mimeType: messageAttachment.mimeType || 'application/octet-stream',
          size: messageAttachment.size,
        };
      },
      authContext,
    );
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
