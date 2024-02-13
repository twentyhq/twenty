import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';

export type DeleteMessageChannelMessageAssociationJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class DeleteMessageChannelMessageAssociationJob
  implements MessageQueueJob<DeleteMessageChannelMessageAssociationJobData>
{
  private readonly logger = new Logger(
    DeleteMessageChannelMessageAssociationJob.name,
  );

  constructor(
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
  ) {}

  async handle(
    data: DeleteMessageChannelMessageAssociationJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting message channel message association for message channel ${data.messageChannelId} in workspace ${data.workspaceId}`,
    );

    await this.messageChannelMessageAssociationService.deleteByMessageChannelId(
      data.messageChannelId,
      data.workspaceId,
    );

    this.logger.log(
      `Deleted message channel message association for message channel ${data.messageChannelId} in workspace ${data.workspaceId}`,
    );
  }
}
