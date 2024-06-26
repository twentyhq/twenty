import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingCleanCacheJob,
  MessagingCleanCacheJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-clean-cache';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import {
  MessagingCreateCompanyAndContactAfterSyncJobData,
  MessagingCreateCompanyAndContactAfterSyncJob,
} from 'src/modules/messaging/message-participants-manager/jobs/messaging-create-company-and-contact-after-sync.job';

@Injectable()
export class MessagingMessageImportManagerMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<MessageChannelWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<MessagingCleanCacheJobData>(
      MessagingCleanCacheJob.name,
      {
        workspaceId: payload.workspaceId,
        messageChannelId: payload.recordId,
      },
    );
  }

  @OnEvent('messageChannel.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<MessageChannelWorkspaceEntity>,
  ) {
    if (
      objectRecordChangedProperties(
        payload.properties.before,
        payload.properties.after,
      ).includes('isContactAutoCreationEnabled') &&
      payload.properties.after.isContactAutoCreationEnabled
    ) {
      await this.messageQueueService.add<MessagingCreateCompanyAndContactAfterSyncJobData>(
        MessagingCreateCompanyAndContactAfterSyncJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelId: payload.recordId,
        },
      );
    }
  }
}
