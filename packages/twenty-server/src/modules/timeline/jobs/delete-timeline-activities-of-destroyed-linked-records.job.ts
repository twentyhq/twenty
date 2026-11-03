import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';

@Processor(MessageQueue.entityEventsToDbQueue)
export class DeleteTimelineActivitiesOfDestroyedLinkedRecordsJob {
  constructor(
    private readonly timelineActivityService: TimelineActivityService,
  ) {}

  @Process(DeleteTimelineActivitiesOfDestroyedLinkedRecordsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ): Promise<void> {
    if (workspaceEventBatch.events.length === 0) {
      return;
    }

    await this.timelineActivityService.deleteActivitiesOfDestroyedLinkedRecords(
      workspaceEventBatch,
    );
  }
}
