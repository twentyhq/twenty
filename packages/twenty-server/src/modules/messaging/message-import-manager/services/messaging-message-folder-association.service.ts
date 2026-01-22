import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';

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
  private readonly logger = new Logger(
    MessagingMessageFolderAssociationService.name,
  );

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

        const messageChannelMessageAssociationIds = associations.map(
          (association) => association.messageChannelMessageAssociationId,
        );

        const existingAssociations = await repository.find(
          {
            where: {
              messageChannelMessageAssociationId: In(
                messageChannelMessageAssociationIds,
              ),
            },
          },
          transactionManager,
        );

        const existingSet = new Set(
          existingAssociations.map(
            (association) =>
              `${association.messageChannelMessageAssociationId}:${association.messageFolderId}`,
          ),
        );

        const associationsToCreate = associations
          .flatMap((association) =>
            association.messageFolderIds.map((folderId) => ({
              messageChannelMessageAssociationId:
                association.messageChannelMessageAssociationId,
              messageFolderId: folderId,
            })),
          )
          .filter(
            (association) =>
              !existingSet.has(
                `${association.messageChannelMessageAssociationId}:${association.messageFolderId}`,
              ),
          );

        if (associationsToCreate.length > 0) {
          try {
            await repository.insert(associationsToCreate, transactionManager);
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes('duplicate key')
            ) {
              this.logger.debug(
                'Duplicate key encountered during insert, records already exist',
              );
            } else {
              throw error;
            }
          }
        }
      },
    );
  }
}
