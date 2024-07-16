import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CalendarEventParticipantMatchParticipantJob,
  CalendarEventParticipantMatchParticipantJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-match-participant.job';
import {
  CalendarEventParticipantUnmatchParticipantJobData,
  CalendarEventParticipantUnmatchParticipantJob,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-event-participant-unmatch-participant.job';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CalendarEventParticipantWorkspaceMemberListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    if (payload.properties.after.userEmail === null) {
      return;
    }

    await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
      CalendarEventParticipantMatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        email: payload.properties.after.userEmail,
        workspaceMemberId: payload.properties.after.id,
      },
    );
  }

  @OnEvent('workspaceMember.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<WorkspaceMemberWorkspaceEntity>,
  ) {
    if (
      objectRecordUpdateEventChangedProperties<WorkspaceMemberWorkspaceEntity>(
        payload.properties.before,
        payload.properties.after,
      ).includes('userEmail')
    ) {
      await this.messageQueueService.add<CalendarEventParticipantUnmatchParticipantJobData>(
        CalendarEventParticipantUnmatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.properties.before.userEmail,
          personId: payload.recordId,
        },
      );

      await this.messageQueueService.add<CalendarEventParticipantMatchParticipantJobData>(
        CalendarEventParticipantMatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.properties.after.userEmail,
          workspaceMemberId: payload.recordId,
        },
      );
    }
  }
}
