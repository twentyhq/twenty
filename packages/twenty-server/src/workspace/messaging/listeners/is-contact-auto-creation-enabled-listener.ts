import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/integrations/event-emitter/types/object-record-update.event';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/integrations/event-emitter/utils/object-record-changed-properties.util';
import {
  CreateCompaniesAndContactsAfterSyncJob,
  CreateCompaniesAndContactsAfterSyncJobData,
} from 'src/workspace/messaging/jobs/create-companies-and-contacts-after-sync.job';

@Injectable()
export class IsContactAutoCreationEnabledListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.updated')
  handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<MessageChannelObjectMetadata>,
  ) {
    if (
      objectRecordUpdateEventChangedProperties(
        payload.previousRecord,
        payload.updatedRecord,
      ).includes('isContactAutoCreationEnabled') &&
      payload.updatedRecord.isContactAutoCreationEnabled
    ) {
      this.messageQueueService.add<CreateCompaniesAndContactsAfterSyncJobData>(
        CreateCompaniesAndContactsAfterSyncJob.name,
        {
          workspaceId: payload.workspaceId,
          messageChannelId: payload.updatedRecord.id,
        },
      );
    }
  }
}
