import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { In, MoreThan } from 'typeorm';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE = 500;
const MESSAGE_EXTERNAL_ID_DELETION_CHUNK_SIZE = 200;

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

        const messageParticipantRepository =
          this.workspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
            'messageParticipant',
          );

        let cursorId: string | undefined;
        let totalDeletedCount = 0;

        for (;;) {
          const associations =
            await messageChannelMessageAssociationRepository.find({
              where: {
                messageChannelId,
                ...(isDefined(cursorId) ? { id: MoreThan(cursorId) } : {}),
              },
              order: { id: 'ASC' },
              take: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE,
            });

          if (associations.length === 0) {
            break;
          }

          const messageIds = [
            ...new Set(
              associations
                .map((association) => association.messageId)
                .filter(isNonEmptyString),
            ),
          ];

          const senders = await messageParticipantRepository.find({
            where: {
              messageId: In(messageIds),
              role: MessageParticipantRole.FROM,
            },
          });

          const groupEmailMessageIds = new Set(
            senders
              .filter(
                (sender) =>
                  isNonEmptyString(sender.handle) &&
                  isGroupEmail(sender.handle),
              )
              .map((sender) => sender.messageId),
          );

          const messageExternalIdsToDelete = associations
            .filter((association) =>
              groupEmailMessageIds.has(association.messageId),
            )
            .map((association) => association.messageExternalId)
            .filter(isNonEmptyString);

          for (const messageExternalIdsChunk of chunk(
            messageExternalIdsToDelete,
            MESSAGE_EXTERNAL_ID_DELETION_CHUNK_SIZE,
          )) {
            await this.messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
              {
                workspaceId,
                messageExternalIds: messageExternalIdsChunk,
                messageChannelId,
              },
            );

            totalDeletedCount += messageExternalIdsChunk.length;
          }

          if (
            associations.length < MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_BATCH_SIZE
          ) {
            break;
          }

          cursorId = associations[associations.length - 1].id;
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
