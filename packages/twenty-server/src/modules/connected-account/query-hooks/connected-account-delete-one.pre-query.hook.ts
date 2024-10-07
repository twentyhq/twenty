import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@WorkspaceQueryHook(`connectedAccount.destroyOne`)
export class ConnectedAccountDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: DeleteOneResolverArgs,
  ): Promise<DeleteOneResolverArgs> {
    const connectedAccountId = payload.id;

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.findBy({
      connectedAccountId,
    });

    this.workspaceEventEmitter.emit(
      'messageChannel.destroyed',
      messageChannels.map(
        (messageChannel) =>
          ({
            recordId: messageChannel.id,
          }) satisfies Pick<
            ObjectRecordDeleteEvent<MessageChannelWorkspaceEntity>,
            'recordId'
          >,
      ),
      authContext.workspace.id,
    );

    return payload;
  }
}
