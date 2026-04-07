import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';
import { type Repository } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class ConnectedAccountListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  @OnDatabaseBatchEvent('connectedAccount', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<ConnectedAccountEntity>
    >,
  ) {
    const workspaceId = payload.workspaceId;
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      for (const eventPayload of payload.events) {
        const userWorkspaceId = eventPayload.properties.before.userWorkspaceId;

        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { id: userWorkspaceId },
        });

        if (!userWorkspace) {
          continue;
        }

        const userId = userWorkspace.userId;

        const connectedAccountId = eventPayload.properties.before.id;

        await this.accountsToReconnectService.removeAccountToReconnect(
          userId,
          workspaceId,
          connectedAccountId,
        );
      }
    }, authContext);
  }
}
