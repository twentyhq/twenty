import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  CONNECTED_ACCOUNT_DELETED_EVENT,
  type ConnectedAccountDeletedEvent,
} from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Injectable()
export class ConnectedAccountListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<ConnectedAccountDeletedEvent>,
  ) {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      for (const event of batchEvent.events) {
        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { id: event.userWorkspaceId },
        });

        if (!userWorkspace) {
          continue;
        }

        await this.accountsToReconnectService.removeAccountToReconnect(
          userWorkspace.userId,
          workspaceId,
          event.connectedAccountId,
        );
      }
    }, authContext);
  }
}
