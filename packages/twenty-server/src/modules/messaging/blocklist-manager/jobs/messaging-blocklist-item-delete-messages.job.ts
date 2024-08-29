import { Logger, Scope } from '@nestjs/common';

import { Any } from 'typeorm';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type BlocklistItemDeleteMessagesJobData = WorkspaceEventBatch<
  ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
>;

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
    const workspaceId = data.workspaceId;

    const blocklistItemIds = data.events.map(
      (eventPayload) => eventPayload.recordId,
    );

    const blocklistRepository =
      await this.twentyORMManager.getRepository<BlocklistWorkspaceEntity>(
        'blocklist',
      );

    const blocklist = await blocklistRepository.find({
      where: {
        id: Any(blocklistItemIds),
      },
    });

    const handlesToDeleteByWorkspaceMemberIdMap = blocklist.reduce(
      (acc, blocklistItem) => {
        const { handle, workspaceMemberId } = blocklistItem;

        if (!acc.has(workspaceMemberId)) {
          acc.set(workspaceMemberId, []);
        }

        acc.get(workspaceMemberId)?.push(handle);

        return acc;
      },
      new Map<string, string[]>(),
    );

    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    for (const workspaceMemberId of handlesToDeleteByWorkspaceMemberIdMap.keys()) {
      const handles =
        handlesToDeleteByWorkspaceMemberIdMap.get(workspaceMemberId);

      if (!handles) {
        continue;
      }

      this.logger.log(
        `Deleting messages from ${handles.join(
          ', ',
        )} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
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
                handle: Any(handles),
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

      this.logger.log(
        `Deleted messages from handle ${handles.join(
          ', ',
        )} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
      );
    }

    await this.threadCleanerService.cleanWorkspaceThreads(workspaceId);
  }
}
