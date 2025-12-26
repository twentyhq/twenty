import { Scope } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { And, Any, ILike, In, Not, Or } from 'typeorm';
import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type BlocklistItemDeleteMessagesJobData = WorkspaceEventBatch<
  ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class BlocklistItemDeleteMessagesJob {
  constructor(
    private readonly threadCleanerService: MessagingMessageCleanerService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(BlocklistItemDeleteMessagesJob.name)
  async handle(data: BlocklistItemDeleteMessagesJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const blocklistItemIds = data.events.map(
          (eventPayload) => eventPayload.recordId,
        );

        const blocklistRepository =
          await this.globalWorkspaceOrmManager.getRepository<BlocklistWorkspaceEntity>(
            workspaceId,
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

            if (!isDefined(handle)) {
              return acc;
            }

            acc.get(workspaceMemberId)?.push(handle);

            return acc;
          },
          new Map<string, string[]>(),
        );

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        for (const workspaceMemberId of handlesToDeleteByWorkspaceMemberIdMap.keys()) {
          const handles =
            handlesToDeleteByWorkspaceMemberIdMap.get(workspaceMemberId);

          if (!handles) {
            continue;
          }

          const rolesToDelete = [
            MessageParticipantRole.FROM,
            MessageParticipantRole.TO,
          ] as const;

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
        }

        await this.threadCleanerService.cleanOrphanMessagesAndThreads(
          workspaceId,
        );
      },
    );
  }
}
