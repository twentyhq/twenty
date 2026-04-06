import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, Repository } from 'typeorm';
import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { MessageChannelSyncStage } from 'twenty-shared/types';
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
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type BlocklistReimportMessagesJobData = WorkspaceEventBatch<
  ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class BlocklistReimportMessagesJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly messagingChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(BlocklistReimportMessagesJob.name)
  async handle(data: BlocklistReimportMessagesJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
        );

      for (const eventPayload of data.events) {
        const workspaceMemberId =
          eventPayload.properties.before.workspaceMemberId;

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
          where: {
            connectedAccountId: In(connectedAccountIds),
            syncStage: Not(MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING),
            workspaceId,
          },
        });

        await this.messagingChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
          messageChannels.map((messageChannel) => messageChannel.id),
          workspaceId,
        );
      }
    }, authContext);
  }
}
