import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE = 500;

type MessageBatchRawResult = {
  mcmaId: string;
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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messagingMessageCleanerService: MessagingMessageCleanerService,
  ) {}

  async deleteGroupEmailMessages(
    workspaceId: string,
    messageChannelId: string,
  ): Promise<number> {
    this.logger.log(
      `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Deleting messages from group email addresses`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelMessageAssociationRepository =
          this.workspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          );

        let cursorId: string | undefined;
        let totalDeletedCount = 0;

        for (;;) {
          const batchQueryBuilder = messageChannelMessageAssociationRepository
            .createQueryBuilder('mcma')
            .select('mcma.id', 'mcmaId')
            .addSelect('mcma.messageId', 'messageId')
            .addSelect('mcma.messageExternalId', 'messageExternalId')
            .addSelect('participant.handle', 'participantHandle')
            .innerJoin('mcma.message', 'message')
            .innerJoin(
              'message.messageParticipants',
              'participant',
              'participant.role = :role',
            )
            .setParameter('role', MessageParticipantRole.FROM)
            .where('mcma.messageChannelId = :messageChannelId', {
              messageChannelId,
            })
            .orderBy('mcma.id', 'ASC')
            .take(MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE);

          if (isDefined(cursorId)) {
            batchQueryBuilder.andWhere('mcma.id > :cursorId', { cursorId });
          }

          const batch: MessageBatchRawResult[] =
            await batchQueryBuilder.getRawMany<MessageBatchRawResult>();

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

                this.logger.debug(
                  `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Deleted ${messageExternalIdsChunk.length} group email messages`,
                );
              }
            }
          }

          if (batch.length < MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE) {
            break;
          }

          const nextCursorId = batch[batch.length - 1].mcmaId;

          if (!isNonEmptyString(nextCursorId)) {
            throw new Error(
              `Message channel ${messageChannelId} group email deletion could not read a cursor from its last row, aborting to avoid an unbounded scan`,
            );
          }

          cursorId = nextCursorId;
        }

        this.logger.log(
          `WorkspaceId: ${workspaceId}, MessageChannelId: ${messageChannelId} - Completed deleting ${totalDeletedCount} group email messages`,
        );

        return totalDeletedCount;
      },
      authContext,
      { lite: true },
    );
  }
}
