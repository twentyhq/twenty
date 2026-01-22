import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';

export type MessageChannelMessageAssociationFolderAssociation = {
  messageChannelMessageAssociationId: string;
  messageFolderIds: string[];
};

@Injectable()
export class MessagingMessageFolderAssociationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async saveMessageFolderAssociations(
    associations: MessageChannelMessageAssociationFolderAssociation[],
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<void> {
    if (associations.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const repository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationMessageFolderWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociationMessageFolder',
          );

        const records = associations.flatMap((association) =>
          association.messageFolderIds.map((folderId) => ({
            messageChannelMessageAssociationId:
              association.messageChannelMessageAssociationId,
            messageFolderId: folderId,
          })),
        );

        if (records.length > 0) {
          await repository.upsert(
            records,
            {
              conflictPaths: [
                'messageChannelMessageAssociationId',
                'messageFolderId',
              ],
              skipUpdateIfNoValuesChanged: true,
            },
            transactionManager,
          );
        }
      },
    );
  }
}
