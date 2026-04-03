import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { And, Any, ILike, In, Not, Or, Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  @Process(BlocklistItemDeleteMessagesJob.name)
  async handle(data: BlocklistItemDeleteMessagesJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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

      const messageChannelMessageAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageAssociation',
        );

      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
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

        const workspaceMember = await workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
        });

        if (!workspaceMember) {
          continue;
        }

        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { userId: workspaceMember.userId, workspaceId },
        });

        if (!userWorkspace) {
          continue;
        }

        const connectedAccounts = await this.connectedAccountRepository.find({
          where: { userWorkspaceId: userWorkspace.id, workspaceId },
        });

        const connectedAccountIds = connectedAccounts.map((ca) => ca.id);

        if (connectedAccountIds.length === 0) {
          continue;
        }

        const messageChannels = await this.messageChannelRepository.find({
          select: {
            id: true,
            handle: true,
            connectedAccount: {
              handleAliases: true,
            },
          },
          where: {
            connectedAccountId: In(connectedAccountIds),
            workspaceId,
          },
          relations: { connectedAccount: true },
        });

        for (const messageChannel of messageChannels) {
          const messageChannelHandles = [messageChannel.handle];

          const handleAliases = messageChannel.connectedAccount?.handleAliases;

          if (isDefined(handleAliases)) {
            const aliasList: string[] = Array.isArray(handleAliases)
              ? handleAliases
              : (handleAliases as string).split(',');

            messageChannelHandles.push(...aliasList);
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
    }, authContext);
  }
}
