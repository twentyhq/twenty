import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@WorkspaceQueryHook(`connectedAccount.destroyOne`)
export class ConnectedAccountDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const connectedAccountId = payload.id;

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const messageChannels =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const messageChannelRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
              workspace.id,
              'messageChannel',
            );

          return messageChannelRepository.findBy({
            connectedAccountId,
          });
        },
        authContext as WorkspaceAuthContext,
      );

    const { flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const flatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.messageChannel.universalIdentifier,
    });

    // TODO: handle cascade events for delete
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'messageChannel',
      action: DatabaseEventAction.DESTROYED,
      objectMetadata: flatObjectMetadata,
      events: messageChannels.map((messageChannel) => ({
        recordId: messageChannel.id,
        properties: {
          before: messageChannel,
        },
      })),
      workspaceId: workspace.id,
    });

    return payload;
  }
}
