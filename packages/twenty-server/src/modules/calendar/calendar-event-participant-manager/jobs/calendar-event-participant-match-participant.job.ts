import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';

export type CalendarEventParticipantMatchParticipantJobData = {
  workspaceId: string;
  isPrimaryEmail: boolean;
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
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly matchParticipantService: MatchParticipantService<CalendarEventParticipantWorkspaceEntity>,
  ) {}

  @Process(CalendarEventParticipantMatchParticipantJob.name)
  async handle(
    data: CalendarEventParticipantMatchParticipantJobData,
  ): Promise<void> {
    const { workspaceId, isPrimaryEmail, email, personId, workspaceMemberId } =
      data;

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (workspace?.activationStatus !== 'ACTIVE') {
      return;
    }

    if (personId) {
      await this.matchParticipantService.matchParticipantsAfterPersonCreation({
        handle: email,
        isPrimaryEmail,
        objectMetadataName: 'calendarEventParticipant',
        personId,
      });
    }

    if (workspaceMemberId) {
      await this.matchParticipantService.matchParticipantsAfterWorkspaceMemberCreation(
        {
          handle: email,
          objectMetadataName: 'calendarEventParticipant',
          workspaceMemberId,
        },
      );
    }
  }
}
