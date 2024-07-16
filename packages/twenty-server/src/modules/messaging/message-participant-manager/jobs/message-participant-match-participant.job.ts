import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

export type MessageParticipantMatchParticipantJobData = {
  workspaceId: string;
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
    private readonly messageParticipantService: MessagingMessageParticipantService,
  ) {}

  @Process(MessageParticipantMatchParticipantJob.name)
  async handle(data: MessageParticipantMatchParticipantJobData): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    await this.messageParticipantService.matchMessageParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );
  }
}
