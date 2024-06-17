import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  DeleteConnectedAccountAssociatedCalendarDataJobData,
  DeleteConnectedAccountAssociatedCalendarDataJob,
} from 'src/modules/calendar/jobs/delete-connected-account-associated-calendar-data.job';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessagingConnectedAccountDeletionCleanupJob,
  MessagingConnectedAccountDeletionCleanupJobData,
} from 'src/modules/messaging/message-cleaner/jobs/messaging-connected-account-deletion-cleanup.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';

@Injectable()
export class MessagingMessageCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnEvent('connectedAccount.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<MessagingConnectedAccountDeletionCleanupJobData>(
      MessagingConnectedAccountDeletionCleanupJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.recordId,
      },
    );

    await this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
      DeleteConnectedAccountAssociatedCalendarDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.recordId,
      },
    );
  }
}
