import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type MessageParticipantMatchParticipantJobData = {
  workspaceId: string;
  participantMatching: {
    personIds: string[];
    personEmails: string[];
    workspaceMemberIds: string[];
  };
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageParticipantMatchParticipantJob {
  constructor(
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
  ) {}

  @Process(MessageParticipantMatchParticipantJob.name)
  async handle(data: MessageParticipantMatchParticipantJobData): Promise<void> {
    const { participantMatching, workspaceId } = data;

    if (
      participantMatching.personIds.length > 0 ||
      participantMatching.personEmails.length > 0
    ) {
      await this.matchParticipantService.matchParticipantsForPeople({
        participantMatching,
        objectMetadataName: 'messageParticipant',
        workspaceId,
      });
    }

    if (participantMatching.workspaceMemberIds.length > 0) {
      await this.matchParticipantService.matchParticipantsForWorkspaceMembers({
        participantMatching,
        objectMetadataName: 'messageParticipant',
        workspaceId,
      });
    }
  }
}
