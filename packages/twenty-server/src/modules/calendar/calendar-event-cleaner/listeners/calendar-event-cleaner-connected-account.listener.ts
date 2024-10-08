import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import {
  DeleteConnectedAccountAssociatedCalendarDataJob,
  DeleteConnectedAccountAssociatedCalendarDataJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalendarEventCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnEvent('connectedAccount.destroyed')
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
          DeleteConnectedAccountAssociatedCalendarDataJob.name,
          {
            workspaceId: payload.workspaceId,
            connectedAccountId: eventPayload.recordId,
          },
        ),
      ),
    );
  }
}
