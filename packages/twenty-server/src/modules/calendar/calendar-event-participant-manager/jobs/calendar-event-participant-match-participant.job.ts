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
  participantMatching: {
    personIds: string[];
    personEmails: string[];
    workspaceMemberIds: string[];
  };
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
    const { workspaceId, participantMatching } = data;

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (workspace?.activationStatus !== 'ACTIVE') {
      return;
    }

    if (
      participantMatching.personIds.length > 0 ||
      participantMatching.personEmails.length > 0
    ) {
      await this.matchParticipantService.matchParticipantsForPeople({
        objectMetadataName: 'calendarEventParticipant',
        participantMatching,
      });
    }

    if (participantMatching.workspaceMemberIds.length > 0) {
      await this.matchParticipantService.matchParticipantsForWorkspaceMembers({
        objectMetadataName: 'calendarEventParticipant',
        participantMatching,
      });
    }
  }
}
