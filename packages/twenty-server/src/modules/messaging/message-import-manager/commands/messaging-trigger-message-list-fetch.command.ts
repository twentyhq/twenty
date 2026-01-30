import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import {
  MessageChannelSyncStage,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

type MessagingTriggerMessageListFetchCommandOptions = {
  workspaceId: string;
  messageChannelId?: string;
};

@Command({
  name: 'messaging:trigger-message-list-fetch',
  description:
    'Trigger message list fetch immediately without waiting for cron',
})
export class MessagingTriggerMessageListFetchCommand extends CommandRunner {
  private readonly logger = new Logger(
    MessagingTriggerMessageListFetchCommand.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: MessagingTriggerMessageListFetchCommandOptions,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = options;

    this.logger.log(
      `Triggering message list fetch for workspace ${workspaceId}${messageChannelId ? ` and channel ${messageChannelId}` : ' (all pending channels)'}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannelRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
          workspaceId,
          'messageChannel',
        );

      const whereCondition: Record<string, unknown> = {
        isSyncEnabled: true,
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      };

      if (messageChannelId) {
        whereCondition.id = messageChannelId;
      }

      const messageChannels =
        await messageChannelRepository.find(whereCondition);

      if (messageChannels.length === 0) {
        this.logger.warn(
          'No message channels found with MESSAGE_LIST_FETCH_PENDING status',
        );

        return;
      }

      this.logger.log(
        `Found ${messageChannels.length} message channel(s) to process`,
      );

      for (const messageChannel of messageChannels) {
        await messageChannelRepository.update(messageChannel.id, {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
          syncStageStartedAt: new Date().toISOString(),
        });

        await this.messageQueueService.add<MessagingMessageListFetchJobData>(
          MessagingMessageListFetchJob.name,
          {
            messageChannelId: messageChannel.id,
            workspaceId,
          },
        );

        this.logger.log(
          `Triggered fetch for message channel ${messageChannel.id}`,
        );
      }

      this.logger.log(
        `Successfully triggered ${messageChannels.length} message list fetch job(s)`,
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
    flags: '-m, --message-channel-id [message_channel_id]',
    description:
      'Message Channel ID (optional - if not provided, triggers for all pending channels)',
    required: false,
  })
  parseMessageChannelId(value: string): string {
    return value;
  }
}
