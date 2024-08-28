import { Logger, Scope } from '@nestjs/common';

import { Any } from 'typeorm';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type BlocklistItemDeleteMessagesJobData = {
  workspaceId: string;
  blocklistItemId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class BlocklistItemDeleteMessagesJob {
  private readonly logger = new Logger(BlocklistItemDeleteMessagesJob.name);

  constructor(
    private readonly threadCleanerService: MessagingMessageCleanerService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(BlocklistItemDeleteMessagesJob.name)
  async handle(data: BlocklistItemDeleteMessagesJobData): Promise<void> {
    const { workspaceId, blocklistItemId } = data;

    const blocklistRepository =
      await this.twentyORMManager.getRepository<BlocklistWorkspaceEntity>(
        'blocklist',
      );

    const blocklistItem = await blocklistRepository.findOne({
      where: {
        id: blocklistItemId,
      },
    });

    if (!blocklistItem) {
      this.logger.log(
        `Blocklist item with id ${blocklistItemId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const { handle, workspaceMemberId } = blocklistItem;

    this.logger.log(
      `Deleting messages from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );

    if (!workspaceMemberId) {
      throw new Error(
        `Workspace member ID is not defined for blocklist item ${blocklistItemId} in workspace ${workspaceId}`,
      );
    }

    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const rolesToDelete: ('from' | 'to')[] = ['from', 'to'];

    const messageChannelMessageAssociationsToDelete =
      await messageChannelMessageAssociationRepository.find({
        where: {
          messageChannel: {
            connectedAccount: {
              accountOwnerId: workspaceMemberId,
            },
          },
          message: {
            messageParticipants: {
              handle,
              role: Any(rolesToDelete),
            },
          },
        },
      });

    if (messageChannelMessageAssociationsToDelete.length === 0) {
      return;
    }

    await messageChannelMessageAssociationRepository.delete(
      messageChannelMessageAssociationsToDelete.map(({ id }) => id),
    );

    await this.threadCleanerService.cleanWorkspaceThreads(workspaceId);

    this.logger.log(
      `Deleted messages from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );
  }
}
