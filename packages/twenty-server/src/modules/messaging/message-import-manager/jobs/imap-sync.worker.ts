import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessagingMessageListFetchService } from 'src/modules/messaging/message-import-manager/services/messaging-message-list-fetch.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

export type ImapSyncJobData = {
  messageChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class ImapSyncWorker {
  constructor(
    private readonly messagingMessageListFetchService: MessagingMessageListFetchService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  @Process('imap-sync')
  async handle(data: ImapSyncJobData): Promise<void> {
    const { messageChannelId, workspaceId } = data;

    await this.messagingMonitoringService.track({
      eventName: 'imap_sync_worker.triggered',
      messageChannelId,
      workspaceId,
    });

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannel = await this.messageChannelRepository.findOne({
        where: {
          id: messageChannelId,
          workspaceId,
        },
        relations: { connectedAccount: true, messageFolders: true },
      });

      if (!messageChannel) {
        return;
      }

      if (
        messageChannel.connectedAccount.provider !==
        ConnectedAccountProvider.IMAP_SMTP_CALDAV
      ) {
        return;
      }

      await this.messagingMessageListFetchService.processMessageListFetch(
        messageChannel,
        workspaceId,
      );
    }, authContext);
  }
}
