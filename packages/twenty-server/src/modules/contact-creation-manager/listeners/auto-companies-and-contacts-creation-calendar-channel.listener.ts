import { Injectable } from '@nestjs/common';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  CalendarCreateCompanyAndPersonAfterSyncJob,
  CalendarCreateCompanyAndPersonAfterSyncJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-create-company-and-contact-after-sync.job';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class AutoCompaniesAndContactsCreationCalendarChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('calendarChannel', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageChannelWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) => {
        if (
          objectRecordChangedProperties(
            eventPayload.properties.before,
            eventPayload.properties.after,
          ).includes('isContactAutoCreationEnabled') &&
          eventPayload.properties.after.isContactAutoCreationEnabled
        ) {
          return this.messageQueueService.add<CalendarCreateCompanyAndPersonAfterSyncJobData>(
            CalendarCreateCompanyAndPersonAfterSyncJob.name,
            {
              workspaceId: payload.workspaceId,
              calendarChannelId: eventPayload.recordId,
            },
          );
        }
      }),
    );
  }
}
