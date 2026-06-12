import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CALENDAR_CHANNEL_DELETED_EVENT,
  type CalendarChannelDeletedEvent,
} from 'src/engine/metadata-modules/calendar-channel/constants/calendar-channel-deleted.constant';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import {
  CalendarChannelDeletionCleanupJob,
  type CalendarChannelDeletionCleanupJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/calendar-channel-deletion-cleanup.job';

@Injectable()
export class CalendarEventCleanerCalendarChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnCustomBatchEvent(CALENDAR_CHANNEL_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<CalendarChannelDeletedEvent>,
  ) {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    await Promise.all(
      batchEvent.events.map((event) =>
        this.calendarQueueService.add<CalendarChannelDeletionCleanupJobData>(
          CalendarChannelDeletionCleanupJob.name,
          {
            workspaceId,
            calendarChannelId: event.calendarChannelId,
          },
        ),
      ),
    );
  }
}
