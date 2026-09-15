import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';
import { And, Any, ILike, In, Not, Or, Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { groupBlocklistHandlesByOwner } from 'src/modules/blocklist/utils/group-blocklist-handles-by-owner.util';
import { BLOCKLISTED_PARTICIPANT_ROLES } from 'src/modules/messaging/blocklist-manager/constants/blocklisted-participant-roles.constant';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const blocklistItemIds = data.events.map(
          (eventPayload) => eventPayload.recordId,
        );

        const blocklistRepository =
          this.workspaceOrmManager.getRepository<BlocklistWorkspaceEntity>(
            'blocklist',
          );

        const blocklist = await blocklistRepository.find({
          where: {
            id: Any(blocklistItemIds),
          },
        });

        const { workspaceScopedHandles, handlesByWorkspaceMemberId } =
          groupBlocklistHandlesByOwner(blocklist);

        if (workspaceScopedHandles.length > 0) {
          await this.deleteMessagesForMessageChannels({
            messageChannels:
              await this.findWorkspaceMessageChannels(workspaceId),
            handles: workspaceScopedHandles,
          });
        }

        for (const [workspaceMemberId, handles] of handlesByWorkspaceMemberId) {
          await this.deleteMessagesForMessageChannels({
            messageChannels: await this.findWorkspaceMemberMessageChannels({
              workspaceMemberId,
              workspaceId,
            }),
            handles,
          });
        }

        await this.threadCleanerService.cleanOrphanMessagesAndThreads(
          workspaceId,
        );
      },
      authContext,
      { lite: true },
    );
  }

  private async findWorkspaceMessageChannels(
    workspaceId: string,
  ): Promise<MessageChannelEntity[]> {
    return this.messageChannelRepository.find({
      select: {
        id: true,
        handle: true,
        connectedAccount: {
          handleAliases: true,
        },
      },
      where: { workspaceId },
      relations: { connectedAccount: true },
    });
  }

  private async findWorkspaceMemberMessageChannels({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<MessageChannelEntity[]> {
    const workspaceMemberRepository =
      this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: { id: workspaceMemberId },
    });

    if (!isDefined(workspaceMember)) {
      return [];
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    if (!isDefined(userWorkspace)) {
      return [];
    }

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: { userWorkspaceId: userWorkspace.id, workspaceId },
    });

    if (connectedAccounts.length === 0) {
      return [];
    }

    return this.messageChannelRepository.find({
      select: {
        id: true,
        handle: true,
        connectedAccount: {
          handleAliases: true,
        },
      },
      where: {
        connectedAccountId: In(
          connectedAccounts.map((connectedAccount) => connectedAccount.id),
        ),
        workspaceId,
      },
      relations: { connectedAccount: true },
    });
  }

  private async deleteMessagesForMessageChannels({
    messageChannels,
    handles,
  }: {
    messageChannels: MessageChannelEntity[];
    handles: string[];
  }): Promise<void> {
    const messageChannelMessageAssociationRepository =
      this.workspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const messageParticipantRepository =
      this.workspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
        { shouldBypassPermissionChecks: true },
      );

    for (const messageChannel of messageChannels) {
      const messageChannelHandles = [
        messageChannel.handle,
        ...(messageChannel.connectedAccount?.handleAliases ?? []),
      ];

      const handleConditions = handles.map((handle) => {
        const isHandleDomain = handle.startsWith('@');

        return isHandleDomain
          ? {
              handle: And(
                Or(ILike(`%${handle}`), ILike(`%.${handle.slice(1)}`)),
                Not(In(messageChannelHandles)),
              ),
              role: In(BLOCKLISTED_PARTICIPANT_ROLES),
            }
          : { handle, role: In(BLOCKLISTED_PARTICIPANT_ROLES) };
      });

      const matchingParticipants = await messageParticipantRepository.find({
        where: handleConditions,
        select: { messageId: true },
      });

      const messageIds = [
        ...new Set(
          matchingParticipants.map((participant) => participant.messageId),
        ),
      ];

      if (messageIds.length === 0) {
        continue;
      }

      const messageChannelMessageAssociationsToDelete =
        await messageChannelMessageAssociationRepository.find({
          where: {
            messageChannelId: messageChannel.id,
            messageId: In(messageIds),
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
}
