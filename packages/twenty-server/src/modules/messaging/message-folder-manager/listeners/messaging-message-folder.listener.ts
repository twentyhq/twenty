import { Injectable, Scope } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  MessageFolderImportPolicy,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessagingFolderRetroactiveImportJob,
  type MessagingFolderRetroactiveImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-folder-retroactive-import.job';

@Injectable({ scope: Scope.REQUEST })
export class MessagingMessageFolderListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @OnDatabaseBatchEvent('messageFolder', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageFolderWorkspaceEntity>
    >,
  ): Promise<void> {
    const { workspaceId, events } = payload;

    for (const event of events) {
      const { before, after } = event.properties;

      // Only trigger retroactive import when isSynced changes from false to true
      if (before.isSynced === false && after.isSynced === true) {
        await this.handleFolderEnabled(workspaceId, after);
      }
    }
  }

  private async handleFolderEnabled(
    workspaceId: string,
    folder: MessageFolderWorkspaceEntity,
  ): Promise<void> {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOne({
      where: { id: folder.messageChannelId },
      select: ['id', 'messageFolderImportPolicy'],
    });

    // Only trigger retroactive import in SELECTED_FOLDERS mode
    if (
      messageChannel?.messageFolderImportPolicy !==
      MessageFolderImportPolicy.SELECTED_FOLDERS
    ) {
      return;
    }

    await this.messageQueueService.add<MessagingFolderRetroactiveImportJobData>(
      MessagingFolderRetroactiveImportJob.name,
      {
        workspaceId,
        messageChannelId: folder.messageChannelId,
        messageFolderId: folder.id,
        folderExternalId: folder.externalId,
      },
    );
  }
}
