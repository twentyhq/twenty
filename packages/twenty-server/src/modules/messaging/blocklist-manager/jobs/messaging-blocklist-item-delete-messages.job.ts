import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

export type BlocklistItemDeleteMessagesJobData = {
  workspaceId: string;
  blocklistItemId: string;
};

@Injectable()
export class BlocklistItemDeleteMessagesJob
  implements MessageQueueJob<BlocklistItemDeleteMessagesJobData>
{
  private readonly logger = new Logger(BlocklistItemDeleteMessagesJob.name);

  constructor(
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly threadCleanerService: MessagingMessageCleanerService,
  ) {}

  async handle(data: BlocklistItemDeleteMessagesJobData): Promise<void> {
    const { workspaceId, blocklistItemId } = data;

    const blocklistItem = await this.blocklistRepository.getById(
      blocklistItemId,
      workspaceId,
    );

    if (!blocklistItem) {
      this.logger.log(
        `Blocklist item with id ${blocklistItemId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const { handle, workspaceMemberId } = blocklistItem;

    this.logger.log(
      `Deleting messages from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );

    const messageChannels =
      await this.messageChannelRepository.getIdsByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    const messageChannelIds = messageChannels.map(({ id }) => id);

    const rolesToDelete: ('from' | 'to')[] = ['from', 'to'];

    await this.messageChannelMessageAssociationRepository.deleteByMessageParticipantHandleAndMessageChannelIdsAndRoles(
      handle,
      messageChannelIds,
      rolesToDelete,
      workspaceId,
    );

    await this.threadCleanerService.cleanWorkspaceThreads(workspaceId);

    this.logger.log(
      `Deleted messages from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );
  }
}
