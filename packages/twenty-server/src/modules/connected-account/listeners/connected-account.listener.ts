import { Injectable } from '@nestjs/common';

import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class ConnectedAccountListener {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  @OnDatabaseBatchEvent('connectedAccount', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>
    >,
  ) {
    for (const eventPayload of payload.events) {
      const workspaceMemberId = eventPayload.properties.before.accountOwnerId;
      const workspaceId = payload.workspaceId;
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
        );
      const workspaceMember = await workspaceMemberRepository.findOneOrFail({
        where: { id: workspaceMemberId },
      });

      const userId = workspaceMember.userId;

      const connectedAccountId = eventPayload.properties.before.id;

      await this.accountsToReconnectService.removeAccountToReconnect(
        userId,
        workspaceId,
        connectedAccountId,
      );
    }
  }
}
