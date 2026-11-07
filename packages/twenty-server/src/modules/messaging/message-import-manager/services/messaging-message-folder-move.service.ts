import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageFolderAssociationService } from 'src/modules/messaging/message-import-manager/services/messaging-message-folder-association.service';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';

@Injectable()
export class MessagingMessageFolderMoveService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageFolderAssociationService: MessagingMessageFolderAssociationService,
  ) {}

  // Returns what still needs saving: a sent draft has more to refresh, a plain move doesn't.
  async relinkMovedMessages({
    messages,
    messageChannelId,
    workspaceId,
  }: {
    messages: MessageWithParticipants[];
    messageChannelId: string;
    workspaceId: string;
  }): Promise<MessageWithParticipants[]> {
    return this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      async (transactionScope) => {
        const associations = await transactionScope
          .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          )
          .find({
            where: {
              messageChannelId,
              messageExternalId: In(
                messages.map(({ externalId }) => externalId),
              ),
            },
            relations: { message: true },
          });

        if (associations.length === 0) {
          return messages;
        }

        const folderLinkRepository =
          transactionScope.getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            'messageChannelMessageAssociationMessageFolder',
            { shouldSkipEventEmission: true },
          );

        const folderLinks = await folderLinkRepository.find({
          where: {
            messageChannelMessageAssociationId: In(
              associations.map(({ id }) => id),
            ),
          },
        });

        const movedMessages = messages.flatMap((message) => {
          const association = associations.find(
            ({ messageExternalId }) => messageExternalId === message.externalId,
          );

          if (!isDefined(association)) {
            return [];
          }

          const storedFolderIds = folderLinks
            .filter(
              ({ messageChannelMessageAssociationId }) =>
                messageChannelMessageAssociationId === association.id,
            )
            .map(({ messageFolderId }) => messageFolderId);

          return this.hasMovedBetweenFolders(
            storedFolderIds,
            message.messageFolderIds ?? [],
          )
            ? [
                {
                  messageChannelMessageAssociationId: association.id,
                  messageFolderIds: message.messageFolderIds ?? [],
                  externalId: message.externalId,
                  isSentDraft:
                    association.message?.isDraft === true && !message.isDraft,
                },
              ]
            : [];
        });

        if (movedMessages.length === 0) {
          return messages;
        }

        await folderLinkRepository.delete({
          messageChannelMessageAssociationId: In(
            movedMessages.map(
              ({ messageChannelMessageAssociationId }) =>
                messageChannelMessageAssociationId,
            ),
          ),
        });

        await this.messageFolderAssociationService.saveMessageFolderAssociations(
          movedMessages,
          workspaceId,
          transactionScope,
        );

        const plainMoveExternalIds = new Set(
          movedMessages
            .filter(({ isSentDraft }) => !isSentDraft)
            .map(({ externalId }) => externalId),
        );

        return messages.filter(
          ({ externalId }) => !plainMoveExternalIds.has(externalId),
        );
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private hasMovedBetweenFolders(
    storedFolderIds: string[],
    fetchedFolderIds: string[],
  ): boolean {
    if (!isNonEmptyArray(fetchedFolderIds)) {
      return false;
    }

    const storedFolderIdsSet = new Set(storedFolderIds);
    const fetchedFolderIdsSet = new Set(fetchedFolderIds);

    return (
      storedFolderIdsSet.size !== fetchedFolderIdsSet.size ||
      fetchedFolderIds.some((folderId) => !storedFolderIdsSet.has(folderId))
    );
  }
}
