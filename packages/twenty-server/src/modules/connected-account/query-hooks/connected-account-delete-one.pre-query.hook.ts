import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@WorkspaceQueryHook(`connectedAccount.deleteOne`)
export class ConnectedAccountDeleteOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(
    _userId: string,
    workspaceId: string,
    payload: DeleteOneResolverArgs,
  ): Promise<void> {
    const connectedAccountId = payload.id;

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.findBy({
      connectedAccountId,
    });

    messageChannels.forEach((messageChannel) => {
      this.eventEmitter.emit('messageChannel.deleted', {
        workspaceId,
        recordId: messageChannel.id,
      } satisfies Pick<
        ObjectRecordDeleteEvent<MessageChannelWorkspaceEntity>,
        'workspaceId' | 'recordId'
      >);
    });
  }
}
