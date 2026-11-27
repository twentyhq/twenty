import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';
import { buildMessageFolderAssociationsToInsert } from 'src/modules/messaging/message-import-manager/utils/build-message-folder-associations-to-insert.util';

@Injectable()
export class MessagingMessageFolderAssociationService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async saveMessageFolderAssociations(
    associations: MessageChannelMessageAssociationFolderAssociation[],
    workspaceId: string,
    transactionScope: WorkspaceTransactionScope,
    associationIdsToReplaceLinks: string[],
  ): Promise<string[]> {
    const associationIds = [
      ...new Set(
        associations
          .filter((association) => association.messageFolderIds.length > 0)
          .map((association) => association.messageChannelMessageAssociationId),
      ),
    ];

    if (associationIds.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          transactionScope.getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            'messageChannelMessageAssociationMessageFolder',
          );

        const existingRecords = await repository.find({
          where: {
            messageChannelMessageAssociationId: In(associationIds),
          },
        });

        const recordsToInsert = buildMessageFolderAssociationsToInsert({
          associations,
          existingRecords,
        });

        if (recordsToInsert.length > 0) {
          await repository.insert(recordsToInsert);
        }

        const staleRecords = existingRecords.filter(
          ({ messageChannelMessageAssociationId, messageFolderId }) =>
            associationIdsToReplaceLinks.includes(
              messageChannelMessageAssociationId,
            ) &&
            !associations.some(
              (association) =>
                association.messageChannelMessageAssociationId ===
                  messageChannelMessageAssociationId &&
                association.messageFolderIds.includes(messageFolderId),
            ),
        );

        if (staleRecords.length === 0) {
          return [];
        }

        await transactionScope
          .getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            'messageChannelMessageAssociationMessageFolder',
            { shouldSkipEventEmission: true },
          )
          .delete({ id: In(staleRecords.map(({ id }) => id)) });

        return [
          ...new Set(
            staleRecords.map(
              ({ messageChannelMessageAssociationId }) =>
                messageChannelMessageAssociationId,
            ),
          ),
        ];
      },
      authContext,
      { lite: true },
    );
  }
}
