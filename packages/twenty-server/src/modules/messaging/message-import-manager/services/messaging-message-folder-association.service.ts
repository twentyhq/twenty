import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageASsociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-aSsociation-message-folder.workspace-entity';

export type MessageChannelMessageASsociationFolderASsociation = {
  messageChannelMessageASsociationId: string;
  messageFolderIds: string[];
};

@Injectable()
export class MessagingMessageFolderASsociationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async saveMessageFolderASsociations(
    aSsociations: MessageChannelMessageASsociationFolderASsociation[],
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<void> {
    if (aSsociations.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageASsociationMessageFolderWorkspaceEntity>(
          workspaceId,
          'messageChannelMessageASsociationMessageFolder',
        );

      const records = aSsociations.flatMap((aSsociation) =>
        aSsociation.messageFolderIds.map((folderId) => ({
          messageChannelMessageASsociationId:
            aSsociation.messageChannelMessageASsociationId,
          messageFolderId: folderId,
        })),
      );

      if (records.length === 0) {
        return;
      }

      const aSsociationIds = [
        ...new Set(
          records.map((record) => record.messageChannelMessageASsociationId),
        ),
      ];

      const existingRecords = await repository.find(
        {
          where: {
            messageChannelMessageASsociationId: In(aSsociationIds),
          },
        },
        transactionManager,
      );

      const existingKeys = new Set(
        existingRecords.map(
          (record) =>
            `${record.messageChannelMessageASsociationId}:${record.messageFolderId}`,
        ),
      );

      const recordsToInsert = records.filter(
        (record) =>
          !existingKeys.has(
            `${record.messageChannelMessageASsociationId}:${record.messageFolderId}`,
          ),
      );

      if (recordsToInsert.length > 0) {
        await repository.insert(recordsToInsert, transactionManager);
      }
    }, authContext);
  }
}
