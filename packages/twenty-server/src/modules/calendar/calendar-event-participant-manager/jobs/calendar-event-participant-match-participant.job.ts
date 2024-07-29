import { Scope } from '@nestjs/common';

import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

export type CalendarEventParticipantMatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventParticipantMatchParticipantJob {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
  ) {}

  @Process(CalendarEventParticipantMatchParticipantJob.name)
  async handle(
    data: CalendarEventParticipantMatchParticipantJobData,
  ): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    if (!this.workspaceService.isWorkspaceActivated(workspaceId)) {
      return;
    }

    await this.matchParticipantService.matchParticipantsAfterPersonOrWorkspaceMemberCreation(
      email,
      'calendarEventParticipant',
      personId,
      workspaceMemberId,
    );
  }
}
