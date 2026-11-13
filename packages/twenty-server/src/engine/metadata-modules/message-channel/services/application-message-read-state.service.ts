import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type SetAppMessageThreadReadStateOutput } from 'src/engine/metadata-modules/message-channel/dtos/set-app-message-thread-read-state.output';
import { ApplicationMessageChannelsService } from 'src/engine/metadata-modules/message-channel/services/application-message-channels.service';
import { computeAppMessageThreadReadStateUpdate } from 'src/engine/metadata-modules/message-channel/utils/compute-app-message-thread-read-state-update.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isMessageReadStateProvisioned } from 'src/modules/messaging/common/utils/is-message-read-state-provisioned.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

@Injectable()
export class ApplicationMessageReadStateService {
  constructor(
    private readonly applicationMessageChannelsService: ApplicationMessageChannelsService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async setThreadReadState({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    messageChannelId,
    threadExternalId,
    isRead,
  }: {
    applicationId: string;
    workspaceId: string;
    requestUserWorkspaceId: string | null;
    messageChannelId: string;
    threadExternalId: string;
    isRead: boolean;
  }): Promise<SetAppMessageThreadReadStateOutput> {
    await this.applicationMessageChannelsService.findOwnedOrThrow({
      applicationId,
      workspaceId,
      requestUserWorkspaceId,
      id: messageChannelId,
    });

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (!isMessageReadStateProvisioned(flatFieldMetadataMaps)) {
      return { updatedMessageCount: 0 };
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelMessageAssociationRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<MessageChannelMessageAssociationWorkspaceEntity>(
            'messageChannelMessageAssociation',
          );

        const associations =
          await messageChannelMessageAssociationRepository.find({
            where: {
              messageChannelId,
              messageThreadExternalId: threadExternalId,
            },
            relations: { message: true },
          });

        const associationIdsToUpdate = computeAppMessageThreadReadStateUpdate({
          isRead,
          threadMessages: associations.map((association) => ({
            associationId: association.id,
            isRead: association.isRead,
            direction: association.direction,
            receivedAt: isDefined(association.message?.receivedAt)
              ? new Date(association.message.receivedAt)
              : null,
          })),
        });

        for (const associationIds of chunk(
          associationIdsToUpdate,
          QUERY_MAX_RECORDS,
        )) {
          await messageChannelMessageAssociationRepository.update(
            { id: In(associationIds) },
            { isRead },
          );
        }

        return { updatedMessageCount: associationIdsToUpdate.length };
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
