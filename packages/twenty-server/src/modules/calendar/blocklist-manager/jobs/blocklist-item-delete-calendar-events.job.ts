import { Scope } from '@nestjs/common';

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

export type BlocklistItemDeleteCalendarEventsJobData = WorkspaceEventBatch<
  ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class BlocklistItemDeleteCalendarEventsJob {
  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(BlocklistItemDeleteCalendarEventsJob.name)
  async handle(data: BlocklistItemDeleteCalendarEventsJobData): Promise<void> {
    // Blocking a handle deletes their messages but deliberately leaves calendar
    // events alone: an event the blocked handle merely attended is still the
    // workspace's own meeting, so it is not swept up with them. We only clean up
    // events that were orphaned by other means.
    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      data.workspaceId,
    );
  }
}
