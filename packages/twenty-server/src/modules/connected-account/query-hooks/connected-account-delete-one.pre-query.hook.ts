import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@WorkspaceQueryHook(`connectedAccount.destroyOne`)
export class ConnectedAccountDeleteOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const connectedAccountId = payload.id;

    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.findBy({
      connectedAccountId,
    });

    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'messageChannel',
        workspaceId: workspace.id,
      },
    });

    // TODO: handle cascade events for delete
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'messageChannel',
      action: DatabaseEventAction.DESTROYED,
      events: messageChannels.map((messageChannel) => ({
        recordId: messageChannel.id,
        objectMetadata,
        properties: {
          before: messageChannel,
        },
      })),
      workspaceId: workspace.id,
    });

    return payload;
  }
}
