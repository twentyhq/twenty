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
import { isSyncStale } from 'src/modules/messaging/message-import-manager/utils/is-sync-stale.util';

const toIsoStringOrNull = (
  value: string | Date | null | undefined,
): string | null => {
  if (value == null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
};

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

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannels = await this.messageChannelRepository.find({
        where: {
          syncStage: In([
            MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
            MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
            MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
            MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
          ]),
          workspaceId,
        },
      });

      for (const messageChannel of messageChannels) {
        if (isSyncStale(toIsoStringOrNull(messageChannel.syncStageStartedAt))) {
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
            default:
              break;
          }
        }
      }
    }, authContext);
  }
}
