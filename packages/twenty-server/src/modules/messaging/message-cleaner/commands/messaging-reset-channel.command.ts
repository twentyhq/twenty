import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

type MessagingResetChannelCommandOptions = {
  workspaceId: string;
  messageChannelId: string;
};

@Command({
  name: 'messaging:reset-channel',
  description:
    'Reset a message channel for full resync - clears sync cursor, sets sync stage to pending, and deletes all messages for the channel',
})
export class MessagingResetChannelCommand extends CommandRunner {
  private readonly logger = new Logger(MessagingResetChannelCommand.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: MessagingResetChannelCommandOptions,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = options;

    this.logger.log(
      `Starting reset for message channel ${messageChannelId} in workspace ${workspaceId}`,
    );

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: messageChannelId },
    });

    if (!messageChannel) {
      this.logger.error(
        `Message channel ${messageChannelId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const messageChannelMessageAssociationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    const associations = await messageChannelMessageAssociationRepository.find({
      where: { messageChannelId },
      select: ['messageExternalId'],
    });

    const messageExternalIds = associations
      .map((association) => association.messageExternalId)
      .filter((id): id is string => id !== null);

    if (messageExternalIds.length > 0) {
      this.logger.log(
        `Deleting ${messageExternalIds.length} message associations for channel ${messageChannelId}`,
      );

      await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
        {
          workspaceId,
          messageExternalIds,
          messageChannelId,
        },
      );
    }

    this.logger.log(`Clearing cache for message channel ${messageChannelId}`);

    await this.cacheStorage.del(
      `messages-to-import:${workspaceId}:${messageChannelId}`,
    );

    this.logger.log(
      `Resetting message folders sync cursor for channel ${messageChannelId}`,
    );

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    await messageFolderRepository.update(
      { messageChannelId },
      { syncCursor: null },
    );

    this.logger.log(
      `Resetting message channel sync state for channel ${messageChannelId}`,
    );

    await messageChannelRepository.update(
      { id: messageChannelId },
      {
        syncCursor: null,
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
        syncStageStartedAt: null,
        throttleFailureCount: 0,
      },
    );

    this.logger.log(
      `Successfully reset message channel ${messageChannelId} for full resync`,
    );
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'Workspace ID',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-c, --message-channel-id <message_channel_id>',
    description: 'Message Channel ID',
    required: true,
  })
  parseMessageChannelId(value: string): string {
    return value;
  }
}
