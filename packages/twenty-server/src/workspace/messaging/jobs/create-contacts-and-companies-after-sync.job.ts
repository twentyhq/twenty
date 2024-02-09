import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageParticipantService } from 'src/workspace/messaging/message-participant/message-participant.service';

export type CreateContactsAndCompaniesAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class CreateContactsAndCompaniesAfterSyncJob
  implements MessageQueueJob<CreateContactsAndCompaniesAfterSyncJobData>
{
  constructor(
    private readonly messageParticipantService: MessageParticipantService,
  ) {}

  async handle(
    data: CreateContactsAndCompaniesAfterSyncJobData,
  ): Promise<void> {
    const { workspaceId, messageChannelId } = data;

    const messageParticipantIdsWithoutPersonIdAndWorkspaceMemberId =
      await this.messageParticipantService.getIdsByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
        messageChannelId,
        workspaceId,
      );

    if (messageParticipantIdsWithoutPersonIdAndWorkspaceMemberId.length === 0) {
      return;
    }

    for (const messageParticipantId of messageParticipantIdsWithoutPersonIdAndWorkspaceMemberId) {
      // Create contacts and companies
      // Update message participant with personIds
    }
  }
}
