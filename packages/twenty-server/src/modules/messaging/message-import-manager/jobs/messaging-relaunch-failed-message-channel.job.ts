import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type MessagingRelaunchFailedMessageChannelJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingRelaunchFailedMessageChannelJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(MessagingRelaunchFailedMessageChannelJob.name)
  async handle(data: MessagingRelaunchFailedMessageChannelJobData) {
    const { workspaceId, messageChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
            { shouldBypassPermissionChecks: true },
          );

        const messageChannel = await messageChannelRepository.findOne({
          where: {
            id: messageChannelId,
          },
          relations: {
            connectedAccount: {
              accountOwner: true,
            },
          },
        });

        if (
          !messageChannel ||
          messageChannel.syncStage !== MessageChannelSyncStage.FAILED ||
          messageChannel.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN
        ) {
          return;
        }

        await messageChannelRepository.update(messageChannelId, {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          syncStatus: MessageChannelSyncStatus.ACTIVE,
        });
      },
    );
  }
}
