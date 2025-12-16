import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  @OnDatabaseBatchEvent('connectedAccount', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>
    >,
  ) {
    const workspaceId = payload.workspaceId;
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        for (const eventPayload of payload.events) {
          const workspaceMemberId =
            eventPayload.properties.before.accountOwnerId;

          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );
          const workspaceMember = await workspaceMemberRepository.findOneOrFail(
            {
              where: { id: workspaceMemberId },
            },
          );

          const userId = workspaceMember.userId;

          const connectedAccountId = eventPayload.properties.before.id;

          await this.accountsToReconnectService.removeAccountToReconnect(
            userId,
            workspaceId,
            connectedAccountId,
          );
        }
      },
    );
  }
}
