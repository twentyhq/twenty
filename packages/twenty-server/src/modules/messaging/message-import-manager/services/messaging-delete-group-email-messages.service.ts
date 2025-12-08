import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { MessageParticipantRole } from 'twenty-shared/types';

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE = 500;

type MessageBatchRawResult = {
  messageId: string;
  messageExternalId: string;
  participantHandle: string;
};

@Injectable()
export class MessagingDeleteGroupEmailMessagesService {
  private readonly logger = new Logger(
    MessagingDeleteGroupEmailMessagesService.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {}

  async deleteGroupEmailMessages(
    workspaceId: string,
    messageChannelId: string,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Deleting messages from group email addresses`,
    );

    const messageChannelMessageAssociationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelMessageAssociationWorkspaceEntity>(
        workspaceId,
        'messageChannelMessageAssociation',
      );

    let offset = 0;
    let totalDeletedCount = 0;

    while (true) {
      const batch = await messageChannelMessageAssociationRepository
        .createQueryBuilder('mcma')
        .select('mcma.messageId', 'messageId')
        .addSelect('mcma.messageExternalId', 'messageExternalId')
        .addSelect('participant.handle', 'participantHandle')
        .innerJoin('mcma.message', 'message')
        .innerJoin(
          'message.messageParticipants',
          'participant',
          'participant.role = :role',
          { role: MessageParticipantRole.FROM },
        )
        .where('mcma.messageChannelId = :messageChannelId', {
          messageChannelId,
        })
        .skip(offset)
        .take(MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE)
        .getRawMany<MessageBatchRawResult>();

      if (batch.length === 0) {
        break;
      }

      const groupEmailRecords = batch.filter(
        (record) =>
          isDefined(record.participantHandle) &&
          isGroupEmail(record.participantHandle),
      );

      if (groupEmailRecords.length > 0) {
        const uniqueMessageIds = new Set(
          groupEmailRecords.map((r) => r.messageId),
        );

        const messageExternalIdsToDelete = batch
          .filter((record) => uniqueMessageIds.has(record.messageId))
          .map((record) => record.messageExternalId)
          .filter(isDefined);

        if (messageExternalIdsToDelete.length > 0) {
          const messageExternalIdsChunks = chunk(
            messageExternalIdsToDelete,
            200,
          );

          for (const messageExternalIdsChunk of messageExternalIdsChunks) {
            await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
              {
                workspaceId,
                messageExternalIds: messageExternalIdsChunk,
                messageChannelId,
              },
            );

            totalDeletedCount += messageExternalIdsChunk.length;

            this.logger.log(
              `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Deleted ${messageExternalIdsChunk.length} group email messages`,
            );
          }
        }
      }

      if (batch.length < MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE) {
        break;
      }

      if (groupEmailRecords.length === 0) {
        offset += MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE;
      }
    }

    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed deleting ${totalDeletedCount} group email messages`,
    );

    return totalDeletedCount;
  }
}
