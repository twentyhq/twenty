import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  BlocklistItemDeleteCalendatEventsJobData,
  BlocklistItemDeleteCalendatEventsJob,
} from 'src/modules/calendar/jobs/blocklist-item-delete-calendar-events.job';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';

@Injectable()
export class CalendarEventBlocklistListener {
  constructor(
    @Inject(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistObjectMetadata>,
  ) {
    this.messageQueueService.add<BlocklistItemDeleteCalendatEventsJobData>(
      BlocklistItemDeleteCalendatEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }
}
