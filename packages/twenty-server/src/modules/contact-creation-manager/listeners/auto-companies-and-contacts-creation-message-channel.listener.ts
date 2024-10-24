import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingCreateCompanyAndContactAfterSyncJob,
  MessagingCreateCompanyAndContactAfterSyncJobData,
} from 'src/modules/messaging/message-participant-manager/jobs/messaging-create-company-and-contact-after-sync.job';

@Injectable()
export class AutoCompaniesAndContactsCreationMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('messageChannel.updated')
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageChannelWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) => {
        if (
          objectRecordChangedProperties(
            eventPayload.properties.before,
            eventPayload.properties.after,
          ).includes('isContactAutoCreationEnabled') &&
          eventPayload.properties.after.isContactAutoCreationEnabled
        ) {
          return this.messageQueueService.add<MessagingCreateCompanyAndContactAfterSyncJobData>(
            MessagingCreateCompanyAndContactAfterSyncJob.name,
            {
              workspaceId: payload.workspaceId,
              messageChannelId: eventPayload.recordId,
            },
          );
        }
      }),
    );
  }
}
