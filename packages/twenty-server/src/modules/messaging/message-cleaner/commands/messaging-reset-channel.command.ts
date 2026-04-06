import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

type MessagingResetChannelCommandOptions = {
  workspaceId: string;
  messageChannelId?: string;
};

@Command({
  name: 'messaging:reset-channel',
  description:
    'Reset message channel(s) for full resync. If no channel ID provided, resets all channels in the workspace.',
})
export class MessagingResetChannelCommand extends CommandRunner {
  private readonly logger = new Logger(MessagingResetChannelCommand.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: MessagingResetChannelCommandOptions,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = options;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      this.logger.log(
        `No message channel ID provided, resetting all message channels in workspace ${workspaceId}`,
      );

      const messageChannels = await this.messageChannelRepository.find({
        where: {
          ...(isDefined(messageChannelId) ? { id: messageChannelId } : {}),
          workspaceId,
        },
      });

      if (messageChannels.length === 0) {
        this.logger.log(
          `No message channels found in workspace ${workspaceId}`,
        );

        return;
      }

      this.logger.log(
        `Found ${messageChannels.length} message channels to reset`,
      );

      for (const messageChannel of messageChannels) {
        await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
          [messageChannel.id],
          workspaceId,
        );
        await this.messagingMessageCleanerService.cleanOrphanMessagesAndThreads(
          workspaceId,
        );
      }

      this.logger.log(
        `Successfully reset all ${messageChannels.length} message channels in workspace ${workspaceId}`,
      );
    }, authContext);
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
    flags: '-c, --message-channel-id [message_channel_id]',
    description:
      'Message Channel ID (optional - if not provided, all channels will be reset)',
    required: false,
  })
  parseMessageChannelId(value: string): string {
    return value;
  }
}
