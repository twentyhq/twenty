import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Readable } from 'stream';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  FileException,
  FileExceptionCode,
} from 'src/engine/core-modules/file/file.exception';
import { RemoteFileOriginResolverRegistryService } from 'src/engine/core-modules/file/file-remote-content/services/remote-file-origin-resolver-registry.service';
import { type RemoteFileOriginResolver } from 'src/engine/core-modules/file/file-remote-content/types/remote-file-origin-resolver.type';
import { FILE_REMOTE_ORIGIN_TYPE } from 'src/engine/core-modules/file/types/file-remote-origin-type.type';
import { type FileRemoteOrigin } from 'src/engine/core-modules/file/types/file-remote-origin.type';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MESSAGE_ATTACHMENT_FETCH_RATE_LIMIT_MAX } from 'src/modules/messaging/message-import-manager/constants/message-attachment-fetch-rate-limit-max.constant';
import { MESSAGE_ATTACHMENT_FETCH_RATE_LIMIT_WINDOW_MS } from 'src/modules/messaging/message-import-manager/constants/message-attachment-fetch-rate-limit-window-ms.constant';
import { GmailFetchMessageAttachmentService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-fetch-message-attachment.service';
import { ImapFetchMessageAttachmentService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-fetch-message-attachment.service';
import { MicrosoftFetchMessageAttachmentService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-fetch-message-attachment.service';
import { type FetchMessageAttachmentParams } from 'src/modules/messaging/message-import-manager/types/fetch-message-attachment-params.type';

@Injectable()
export class MessagingRemoteAttachmentService
  implements RemoteFileOriginResolver, OnModuleInit
{
  constructor(
    private readonly remoteFileOriginResolverRegistryService: RemoteFileOriginResolverRegistryService,
    private readonly throttlerService: ThrottlerService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(MessageChannelEntity)
    private readonly messageChannelRepository: WorkspaceScopedRepository<MessageChannelEntity>,
    private readonly gmailFetchMessageAttachmentService: GmailFetchMessageAttachmentService,
    private readonly microsoftFetchMessageAttachmentService: MicrosoftFetchMessageAttachmentService,
    private readonly imapFetchMessageAttachmentService: ImapFetchMessageAttachmentService,
  ) {}

  onModuleInit(): void {
    this.remoteFileOriginResolverRegistryService.register(
      FILE_REMOTE_ORIGIN_TYPE.MESSAGE,
      this,
    );
  }

  async fetchRemoteContent({
    workspaceId,
    remoteOrigin,
  }: {
    workspaceId: string;
    remoteOrigin: FileRemoteOrigin;
  }): Promise<Readable | null> {
    const {
      originId: messageChannelMessageAssociationId,
      originKey: attachmentExternalId,
    } = remoteOrigin;

    if (!isDefined(attachmentExternalId)) {
      return null;
    }

    const messageChannelMessageAssociation =
      await this.findMessageChannelMessageAssociation({
        workspaceId,
        messageChannelMessageAssociationId,
      });

    if (
      !isNonEmptyString(messageChannelMessageAssociation?.messageExternalId)
    ) {
      return null;
    }

    const messageChannel = await this.messageChannelRepository.findOne(
      workspaceId,
      {
        where: { id: messageChannelMessageAssociation.messageChannelId },
        relations: { connectedAccount: true },
      },
    );

    if (!isDefined(messageChannel?.connectedAccount)) {
      return null;
    }

    const { id: connectedAccountId, provider } =
      messageChannel.connectedAccount;

    await this.throttleConnectedAccountFetchOrThrow(connectedAccountId);

    return this.fetchFromProvider({
      provider,
      params: {
        connectedAccountId,
        messageExternalId: messageChannelMessageAssociation.messageExternalId,
        attachmentExternalId,
      },
    });
  }

  private async throttleConnectedAccountFetchOrThrow(
    connectedAccountId: string,
  ): Promise<void> {
    await this.throttlerService
      .tokenBucketThrottleOrThrow(
        `message-attachment-fetch:${connectedAccountId}`,
        1,
        MESSAGE_ATTACHMENT_FETCH_RATE_LIMIT_MAX,
        MESSAGE_ATTACHMENT_FETCH_RATE_LIMIT_WINDOW_MS,
      )
      .catch((error) => {
        if (error instanceof ThrottlerException) {
          throw new FileException(
            `Message attachment fetch limit reached for connected account ${connectedAccountId}`,
            FileExceptionCode.TOO_MANY_REQUESTS,
          );
        }

        throw error;
      });
  }

  private async findMessageChannelMessageAssociation({
    workspaceId,
    messageChannelMessageAssociationId,
  }: {
    workspaceId: string;
    messageChannelMessageAssociationId: string;
  }): Promise<Pick<
    MessageChannelMessageAssociationWorkspaceEntity,
    'messageExternalId' | 'messageChannelId'
  > | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          )
          .findOne({
            where: { id: messageChannelMessageAssociationId },
            select: { messageExternalId: true, messageChannelId: true },
          }),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async fetchFromProvider({
    provider,
    params,
  }: {
    provider: ConnectedAccountProvider;
    params: FetchMessageAttachmentParams;
  }): Promise<Readable | null> {
    switch (provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.gmailFetchMessageAttachmentService.fetchMessageAttachment(
          params,
        );
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftFetchMessageAttachmentService.fetchMessageAttachment(
          params,
        );
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
        return this.imapFetchMessageAttachmentService.fetchMessageAttachment(
          params,
        );
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.APP:
        return null;
      default:
        return assertUnreachable(provider);
    }
  }
}
