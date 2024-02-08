import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageParticipantService } from 'src/workspace/messaging/message-participant/message-participant.service';

export type MatchMessageParticipantsJobData = {
  workspaceId: string;
  updatedPersonId: string;
  updatedEmail: string;
};

@Injectable()
export class MatchMessageParticipantJob
  implements MessageQueueJob<MatchMessageParticipantsJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async handle(data: MatchMessageParticipantsJobData): Promise<void> {
    const { workspaceId, updatedPersonId, updatedEmail } = data;

    const messageParticipantsToUpdate =
      await this.messageParticipantService.getByHandles(
        [updatedEmail],
        workspaceId,
      );

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    await this.messageParticipantService.updateParticipantsPersonId(
      messageParticipantIdsToUpdate,
      updatedPersonId,
      workspaceId,
    );
  }
}
