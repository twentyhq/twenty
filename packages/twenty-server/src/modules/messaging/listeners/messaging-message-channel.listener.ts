import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompaniesAndContactsAfterSyncJobData,
  CreateCompaniesAndContactsAfterSyncJob,
} from 'src/modules/messaging/jobs/create-companies-and-contacts-after-sync.job';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

@Injectable()
export class MessagingMessageChannelListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.updated')
  handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<MessageChannelObjectMetadata>,
  ) {
    if (
      objectRecordChangedProperties(
        payload.details.before,
        payload.details.after,
      ).includes('isContactAutoCreationEnabled') &&
      payload.details.after.isContactAutoCreationEnabled
    ) {
      this.messageQueueService.add<CreateCompaniesAndContactsAfterSyncJobData>(
        CreateCompaniesAndContactsAfterSyncJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelId: payload.recordId,
        },
      );
    }
  }
}
