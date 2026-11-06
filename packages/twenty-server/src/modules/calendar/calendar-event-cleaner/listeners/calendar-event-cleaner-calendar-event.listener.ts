import { Injectable } from '@nestjs/common';

import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { LinkedTimelineActivityDeletionJob } from 'src/modules/timeline/jobs/linked-timeline-activity-deletion.job';
import { type LinkedTimelineActivityDeletion } from 'src/modules/timeline/types/linked-timeline-activity-deletion.type';

@Injectable()
export class CalendarEventCleanerCalendarEventListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('calendarEvent', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const linkedRecordIds = payload.events.map(({ recordId }) => recordId);

    if (linkedRecordIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<LinkedTimelineActivityDeletion>(
      LinkedTimelineActivityDeletionJob.name,
      {
        workspaceId: payload.workspaceId,
        linkedObjectMetadataId: payload.objectMetadata.id,
        linkedRecordIds,
      },
      {
        workspaceId: payload.workspaceId,
        isWorkspaceJob: true,
      },
    );
  }
}
