import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';

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
    @InjectObjectMetadataRepository(MessageParticipantObjectMetadata)
    private readonly messageParticipantRepository: MessageParticipantRepository,
  ) {}

  async handle(data: MatchMessageParticipantsJobData): Promise<void> {
    const { workspaceId, personId, workspaceMemberId, email } = data;

    const messageParticipantsToUpdate =
      await this.messageParticipantRepository.getByHandles(
        [email],
        workspaceId,
      );

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await this.messageParticipantRepository.updateParticipantsPersonId(
        messageParticipantIdsToUpdate,
        personId,
        workspaceId,
      );
    }
    if (workspaceMemberId) {
      await this.messageParticipantRepository.updateParticipantsWorkspaceMemberId(
        messageParticipantIdsToUpdate,
        workspaceMemberId,
        workspaceId,
      );
    }
  }
}
