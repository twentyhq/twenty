import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessagingCreateCompanyAndContactAfterSyncJobData,
  MessagingCreateCompanyAndContactAfterSyncJob,
} from 'src/modules/messaging/message-participant-manager/jobs/messaging-create-company-and-contact-after-sync.job';

@Injectable()
export class AutoCompaniesAndContactsCreationMessageChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

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
