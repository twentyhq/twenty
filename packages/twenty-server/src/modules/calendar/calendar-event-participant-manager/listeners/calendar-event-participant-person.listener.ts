import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  CalendarEventParticipantMatchParticipantJob,
  CalendarEventParticipantMatchParticipantJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import {
  CalendarEventParticipantUnmatchParticipantJob,
  CalendarEventParticipantUnmatchParticipantJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-unmatch-participant.job';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class CalendarEventParticipantPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('person', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<PersonWorkspaceEntity>
    >,
  ) {
    for (const eventPayload of payload.events) {
      if (eventPayload.properties.after.emails?.primaryEmail === null) {
        continue;
      }

      // TODO: modify this job to take an array of participants to match
      await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
        CalendarEventParticipantMatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: eventPayload.properties.after.emails?.primaryEmail,
          personId: eventPayload.recordId,
        },
      );
    }
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    for (const eventPayload of payload.events) {
      if (
        objectRecordUpdateEventChangedProperties(
          eventPayload.properties.before,
          eventPayload.properties.after,
        ).includes('emails')
      ) {
        // TODO: modify this job to take an array of participants to match
        await this.messageQueueService.add<CalendarEventParticipantUnmatchParticipantJobData>(
          CalendarEventParticipantUnmatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.before.emails?.primaryEmail,
            personId: eventPayload.recordId,
          },
        );

        await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
          CalendarEventParticipantMatchParticipantJob.name,
          {
            workspaceId: payload.workspaceId,
            email: eventPayload.properties.after.emails?.primaryEmail,
            personId: eventPayload.recordId,
          },
        );
      }
    }
  }
}
