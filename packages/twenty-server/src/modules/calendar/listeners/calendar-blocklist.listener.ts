import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  BlocklistItemDeleteCalendarEventsJobData,
  BlocklistItemDeleteCalendarEventsJob,
} from 'src/modules/calendar/jobs/blocklist-item-delete-calendar-events.job';
import {
  BlocklistReimportCalendarEventsJobData,
  BlocklistReimportCalendarEventsJob,
} from 'src/modules/calendar/jobs/blocklist-reimport-calendar-events.job';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';

@Injectable()
export class CalendarBlocklistListener {
  constructor(
    @Inject(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistObjectMetadata>,
  ) {
    this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
      BlocklistItemDeleteCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }

  @OnEvent('blocklist.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<BlocklistObjectMetadata>,
  ) {
    await this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
      BlocklistReimportCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        workspaceMemberId: payload.properties.before.workspaceMember.id,
        handle: payload.properties.before.handle,
      },
    );
  }
}
