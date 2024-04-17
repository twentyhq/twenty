import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';

export type DeleteMessagesFromHandleJobData = {
  workspaceId: string;
  workspaceMemberId: string;
  handle: string;
};

@Injectable()
export class DeleteMessagesFromHandleJob
  implements MessageQueueJob<DeleteMessagesFromHandleJobData>
{
  private readonly logger = new Logger(DeleteMessagesFromHandleJob.name);

  constructor(
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(MessageChannelMessageAssociationRepository)
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
  ) {}

  async handle(data: DeleteMessagesFromHandleJobData): Promise<void> {
    this.logger.log(
      `Deleting messages from ${data.handle} in workspace ${data.workspaceId} for workspace member ${data.workspaceMemberId}`,
    );

    const { handle, workspaceId, workspaceMemberId } = data;

    const messageChannelIds =
      await this.messageChannelRepository.getMessageChannelIdsByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    await this.messageChannelMessageAssociationRepository.deleteByMessageParticipantHandleAndMessageChannelIds(
      handle,
      messageChannelIds,
      workspaceId,
    );

    this.logger.log(
      `Deleting messages from handle ${data.handle} in workspace ${data.workspaceId} for workspace member ${data.workspaceMemberId} done`,
    );
  }
}
