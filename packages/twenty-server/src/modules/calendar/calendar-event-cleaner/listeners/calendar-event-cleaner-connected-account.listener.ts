import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  DeleteConnectedAccountAssociatedCalendarDataJob,
  type DeleteConnectedAccountAssociatedCalendarDataJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class CalendarEventCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('connectedAccount', DatabaseEventAction.DESTROYED)
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
