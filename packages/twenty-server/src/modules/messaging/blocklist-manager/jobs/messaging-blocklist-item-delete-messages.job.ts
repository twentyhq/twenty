import { Logger, Scope } from '@nestjs/common';

import { And, Any, ILike, In, Not, Or } from 'typeorm';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
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

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
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

      const messageChannels = await messageChannelRepository.find({
        select: {
          id: true,
          handle: true,
          connectedAccount: {
            handleAliases: true,
          },
        },
        where: {
          connectedAccount: {
            accountOwnerId: workspaceMemberId,
          },
        },
        relations: ['connectedAccount'],
      });

      for (const messageChannel of messageChannels) {
        const messageChannelHandles = [messageChannel.handle];

        if (messageChannel.connectedAccount.handleAliases) {
          messageChannelHandles.push(
            ...messageChannel.connectedAccount.handleAliases.split(','),
          );
        }

        const handleConditions = handles.map((handle) => {
          const isHandleDomain = handle.startsWith('@');

          return isHandleDomain
            ? {
                handle: And(
                  Or(ILike(`%${handle}`), ILike(`%.${handle.slice(1)}`)),
                  Not(In(messageChannelHandles)),
                ),
                role: In(rolesToDelete),
              }
            : { handle, role: In(rolesToDelete) };
        });

        const messageChannelMessageAssociationsToDelete =
          await messageChannelMessageAssociationRepository.find({
            where: {
              messageChannelId: messageChannel.id,
              message: {
                messageParticipants: handleConditions,
              },
            },
          });

        if (messageChannelMessageAssociationsToDelete.length === 0) {
          continue;
        }

        await messageChannelMessageAssociationRepository.delete(
          messageChannelMessageAssociationsToDelete.map(({ id }) => id),
        );
      }

      this.logger.log(
        `Deleted messages from handle ${handles.join(
          ', ',
        )} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
      );
    }

    await this.threadCleanerService.cleanWorkspaceThreads(workspaceId);
  }
}
