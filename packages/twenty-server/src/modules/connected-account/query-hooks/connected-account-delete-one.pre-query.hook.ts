import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
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
        authContext as WorkspaceAuthContext,
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
      );

    const objectMetadataEntity =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'messageChannel',
          workspaceId: workspace.id,
        },
        relations: ['fields', 'indexMetadatas', 'views'],
      });

    const flatObjectMetadata =
      fromObjectMetadataEntityToFlatObjectMetadata(objectMetadataEntity);

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
