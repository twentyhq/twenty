import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import {
  BlocklistItemDeleteCalendarEventsJob,
  BlocklistItemDeleteCalendarEventsJobData,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import {
  BlocklistReimportCalendarEventsJob,
  BlocklistReimportCalendarEventsJobData,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class CalendarBlocklistListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
      BlocklistItemDeleteCalendarEventsJob.name,
      payload,
    );
  }

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.DELETED)
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
      BlocklistReimportCalendarEventsJob.name,
      payload,
    );
  }

  @OnDatabaseBatchEvent('blocklist', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
      BlocklistItemDeleteCalendarEventsJob.name,
      payload,
    );

    await this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
      BlocklistReimportCalendarEventsJob.name,
      payload,
    );
  }
}
