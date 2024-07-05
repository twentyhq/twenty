import { Scope } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

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
    private readonly messageParticipantService: MessagingMessageParticipantService,
  ) {}

  @Process(MessageParticipantUnmatchParticipantJob.name)
  async handle(
    data: MessageParticipantUnmatchParticipantJobData,
  ): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    await this.messageParticipantService.unmatchMessageParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );
  }
}
