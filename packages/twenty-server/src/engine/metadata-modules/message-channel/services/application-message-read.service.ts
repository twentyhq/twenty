import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageChannelType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessageChannelException,
  MessageChannelExceptionCode,
} from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { findAppThreadLatestMessages } from 'src/engine/metadata-modules/message-channel/utils/find-app-thread-latest-messages.util';
import { MessagingProviderThreadReadMarkerService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-thread-read-marker.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

const APP_THREAD_MARK_AS_READ_THROTTLE_TTL_MS = 30 * 1000;

@Injectable()
export class ApplicationMessageReadService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly messagingProviderThreadReadMarkerService: MessagingProviderThreadReadMarkerService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async markThreadAsRead({
    workspaceId,
    userWorkspaceId,
    messageChannelId,
    messageThreadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    messageChannelId: string;
    messageThreadId: string;
  }): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: {
        id: messageChannelId,
        workspaceId,
        type: MessageChannelType.APP,
      },
    });

    if (!isDefined(messageChannel)) {
      throw new MessageChannelException(
        `Message channel ${messageChannelId} not found`,
        MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      );
    }

    // Upstream read state belongs to the account owner, not to members it is shared with.
    const ownedConnectedAccount =
      await this.connectedAccountMetadataService.findByIdAndUserWorkspaceId({
        id: messageChannel.connectedAccountId,
        userWorkspaceId,
        workspaceId,
      });

    if (
      !isDefined(ownedConnectedAccount) ||
      !isDefined(ownedConnectedAccount.connectionProviderId)
    ) {
      return;
    }

    const marker =
      await this.messagingProviderThreadReadMarkerService.resolveMarker({
        messagingProviderUniversalIdentifier:
          messageChannel.messagingProviderUniversalIdentifier,
        connectionProviderId: ownedConnectedAccount.connectionProviderId,
        workspaceId,
      });

    if (!isDefined(marker)) {
      return;
    }

    const throttleKey = `app-thread-mark-as-read:${workspaceId}:${userWorkspaceId}:${messageChannelId}:${messageThreadId}`;

    const hasClaimedThrottle = await this.cacheStorageService.setIfAbsent(
      throttleKey,
      true,
      APP_THREAD_MARK_AS_READ_THROTTLE_TTL_MS,
    );

    if (!hasClaimedThrottle) {
      return;
    }

    try {
      const latestThreadMessages =
        await this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            findAppThreadLatestMessages({
              workspaceOrmManager: this.workspaceOrmManager,
              messageChannelId,
              messageThreadId,
            }),
          buildSystemAuthContext(workspaceId),
          { lite: true },
        );

      if (!isDefined(latestThreadMessages)) {
        await this.cacheStorageService.del(throttleKey);

        return;
      }

      await this.messagingProviderThreadReadMarkerService.markAsReadOrThrow({
        marker,
        workspaceId,
        payload: {
          connectedAccountId: ownedConnectedAccount.id,
          messageChannelId,
          threadExternalId: latestThreadMessages.threadExternalId,
        },
      });
    } catch (error) {
      // a failed mark must not block the next open from retrying
      await this.cacheStorageService.del(throttleKey);

      throw error;
    }
  }
}
