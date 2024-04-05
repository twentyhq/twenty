import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageParticipantService } from 'src/modules/messaging/services/message-participant/message-participant.service';

export type MatchParticipantJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Injectable()
export class MatchParticipantJob
  implements MessageQueueJob<MatchParticipantJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async handle(data: MatchParticipantJobData): Promise<void> {
    const { workspaceId, email, personId, workspaceMemberId } = data;

    await this.messageParticipantService.matchMessageParticipants(
      workspaceId,
      email,
      personId,
      workspaceMemberId,
    );
  }
}
