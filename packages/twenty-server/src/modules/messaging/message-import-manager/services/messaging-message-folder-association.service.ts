import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/global-workspace-datasource/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';
import { type MessageChannelMessageAssociationFolderAssociation } from 'src/modules/messaging/message-import-manager/types/message-channel-message-association-folder-association.type';
import { buildMessageFolderAssociationsToInsert } from 'src/modules/messaging/message-import-manager/utils/build-message-folder-associations-to-insert.util';

@Injectable()
export class MessagingMessageFolderAssociationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async saveMessageFolderAssociations(
    associations: MessageChannelMessageAssociationFolderAssociation[],
    workspaceId: string,
    transactionScope: WorkspaceTransactionScope,
  ): Promise<void> {
    const associationIds = [
      ...new Set(
        associations
          .filter((association) => association.messageFolderIds.length > 0)
          .map((association) => association.messageChannelMessageAssociationId),
      ),
    ];

    if (associationIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          transactionScope.getRepository<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
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
      },
      authContext,
      { lite: true },
    );
  }
}
