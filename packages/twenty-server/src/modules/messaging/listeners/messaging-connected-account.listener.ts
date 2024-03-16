import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  DeleteConnectedAccountAssociatedCalendarDataJobData,
  DeleteConnectedAccountAssociatedCalendarDataJob,
} from 'src/modules/messaging/jobs/delete-connected-account-associated-calendar-data.job';
import {
  DeleteConnectedAccountAssociatedMessagingDataJobData,
  DeleteConnectedAccountAssociatedMessagingDataJob,
} from 'src/modules/messaging/jobs/delete-connected-account-associated-messaging-data.job';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

@Injectable()
export class MessagingConnectedAccountListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @Inject(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnEvent('connectedAccount.deleted')
  handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<ConnectedAccountObjectMetadata>,
  ) {
    this.messageQueueService.add<DeleteConnectedAccountAssociatedMessagingDataJobData>(
      DeleteConnectedAccountAssociatedMessagingDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.deletedRecord.id,
      },
    );

    this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
      DeleteConnectedAccountAssociatedCalendarDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.deletedRecord.id,
      },
    );
  }
}
