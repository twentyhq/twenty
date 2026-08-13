import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { MessageChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MESSAGING_ONGOING_STALE_SYNC_STAGES } from 'src/modules/messaging/message-import-manager/constants/messaging-ongoing-stale-sync-stages.constant';
import { MESSAGING_PENDING_STALE_SYNC_STAGES } from 'src/modules/messaging/message-import-manager/constants/messaging-pending-stale-sync-stages.constant';
import { isPendingSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-pending-sync-stale.util';
import { isSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-sync-stale.util';
import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

export type MessagingOngoingStaleJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingOngoingStaleJob {
  private readonly logger = new Logger(MessagingOngoingStaleJob.name);
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  @Process(MessagingOngoingStaleJob.name)
  async handle(data: MessagingOngoingStaleJobData): Promise<void> {
    const { workspaceId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannels = await this.messageChannelRepository.find({
          where: {
            syncStage: In([
              ...MESSAGING_ONGOING_STALE_SYNC_STAGES,
              ...MESSAGING_PENDING_STALE_SYNC_STAGES,
            ]),
            workspaceId,
          },
        });

        for (const messageChannel of messageChannels) {
          const syncStageStartedAt = toIsoStringOrNull(
            messageChannel.syncStageStartedAt,
          );
          const isPendingStage = MESSAGING_PENDING_STALE_SYNC_STAGES.includes(
            messageChannel.syncStage,
          );
          const isStale = isPendingStage
            ? isPendingSyncStale(syncStageStartedAt)
            : isSyncStale(syncStageStartedAt);

          if (!isStale) {
            continue;
          }

          await this.messageChannelSyncStatusService.resetSyncStageStartedAt(
            [messageChannel.id],
            workspaceId,
          );

          switch (messageChannel.syncStage) {
            case MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING:
            case MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED:
              this.logger.log(
                `Sync for message channel ${messageChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to MESSAGE_LIST_FETCH_PENDING`,
              );
              await this.messageChannelSyncStatusService.markAsMessagesListFetchPending(
                [messageChannel.id],
                workspaceId,
              );
              break;
            case MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING:
            case MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED:
              this.logger.log(
                `Sync for message channel ${messageChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to MESSAGES_IMPORT_PENDING`,
              );
              await this.messageChannelSyncStatusService.markAsMessagesImportPending(
                [messageChannel.id],
                workspaceId,
              );
              break;
            case MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING:
            case MessageChannelSyncStage.MESSAGES_IMPORT_PENDING:
              // Already in the right stage to be picked up by the fast
              // cron — it was stuck here despite that, most likely because
              // a prior cron/queue cycle never ran or never enqueued it.
              // Clearing syncStageStartedAt above (and any stale throttle
              // backoff that depended on it) is the actual recovery step.
              this.logger.log(
                `Message channel ${messageChannel.id} and workspace ${workspaceId} was stuck in ${messageChannel.syncStage} past the sync timeout with no further activity. Clearing it for retry.`,
              );
              break;
            default:
              break;
          }
        }
      },
      authContext,
      { lite: true },
    );
  }
}
