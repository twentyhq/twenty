import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

export type CalendarEventParticipantUnmatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventParticipantUnmatchParticipantJob {
  constructor(
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
  ) {}

  @Process(CalendarEventParticipantUnmatchParticipantJob.name)
  async handle(
    data: CalendarEventParticipantUnmatchParticipantJobData,
  ): Promise<void> {
    const { email, personId, workspaceMemberId } = data;

    await this.matchParticipantService.unmatchParticipants(
      email,
      'calendarEventParticipant',
      personId,
      workspaceMemberId,
    );
  }
}
