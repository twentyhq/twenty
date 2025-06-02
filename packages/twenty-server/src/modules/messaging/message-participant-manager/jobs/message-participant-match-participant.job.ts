import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type MessageParticipantMatchParticipantJobData = {
  workspaceId: string;
  isPrimaryEmail: boolean;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
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
    const { isPrimaryEmail, email, personId, workspaceMemberId } = data;

    if (personId) {
      await this.matchParticipantService.matchParticipantsAfterPersonCreation({
        handle: email,
        isPrimaryEmail,
        objectMetadataName: 'messageParticipant',
        personId,
      });
    }

    if (workspaceMemberId) {
      await this.matchParticipantService.matchParticipantsAfterWorkspaceMemberCreation(
        {
          handle: email,
          objectMetadataName: 'messageParticipant',
          workspaceMemberId,
        },
      );
    }
  }
}
