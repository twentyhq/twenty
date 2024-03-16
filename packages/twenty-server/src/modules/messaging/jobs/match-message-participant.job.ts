import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant/message-participant.repository';

export type MatchMessageParticipantsJobData = {
  workspaceId: string;
  email: string;
  personId?: string;
  workspaceMemberId?: string;
};

@Injectable()
export class MatchMessageParticipantJob
  implements MessageQueueJob<MatchMessageParticipantsJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantRepository,
  ) {}

  async handle(data: MatchMessageParticipantsJobData): Promise<void> {
    const { workspaceId, personId, workspaceMemberId, email } = data;

    const messageParticipantsToUpdate =
      await this.messageParticipantService.getByHandles([email], workspaceId);

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await this.messageParticipantService.updateParticipantsPersonId(
        messageParticipantIdsToUpdate,
        personId,
        workspaceId,
      );
    }
    if (workspaceMemberId) {
      await this.messageParticipantService.updateParticipantsWorkspaceMemberId(
        messageParticipantIdsToUpdate,
        workspaceMemberId,
        workspaceId,
      );
    }
  }
}
