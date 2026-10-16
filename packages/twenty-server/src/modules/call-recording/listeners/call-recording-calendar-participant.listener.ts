import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import { CallRecordingCalendarParticipantService } from 'src/modules/call-recording/services/call-recording-calendar-participant.service';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

@Injectable()
export class CallRecordingCalendarParticipantListener {
  constructor(
    private readonly callRecordingCalendarParticipantService: CallRecordingCalendarParticipantService,
  ) {}

  @OnDatabaseBatchEvent('callRecording', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('callRecording', DatabaseEventAction.UPDATED)
  @OnDatabaseBatchEvent('callRecording', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('callRecording', DatabaseEventAction.DESTROYED)
  @OnDatabaseBatchEvent('callRecording', DatabaseEventAction.RESTORED)
  async handleEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordEvent<CallRecordingWorkspaceEntity>
    >,
  ): Promise<void> {
    const events = filterEventsByUpdatedFields({
      events: payload.events,
      eventName: payload.name,
      watchedFields: [
        'applicationId',
        'calendarEventId',
        'externalBotId',
        'recordingRequestStatus',
        'status',
      ],
    });

    await this.callRecordingCalendarParticipantService.syncParticipants({
      workspaceId: payload.workspaceId,
      callRecordingIds: events.map(({ recordId }) => recordId),
    });
  }
}
