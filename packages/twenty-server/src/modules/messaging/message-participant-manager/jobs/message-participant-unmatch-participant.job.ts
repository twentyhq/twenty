import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type MessageParticipantUnmatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageParticipantUnmatchParticipantJob {
  constructor(
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
  ) {}

  @Process(MessageParticipantUnmatchParticipantJob.name)
  async handle(
    data: MessageParticipantUnmatchParticipantJobData,
  ): Promise<void> {
    const { email, personId, workspaceMemberId } = data;

    await this.matchParticipantService.unmatchParticipants(
      email,
      'messageParticipant',
      personId,
      workspaceMemberId,
    );
  }
}
