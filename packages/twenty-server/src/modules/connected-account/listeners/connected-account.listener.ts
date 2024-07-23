import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  ConnectedAccountKeys,
  ConnectedAccountKeyValueType,
} from 'src/modules/connected-account/types/connected-account-key-value.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountListener {
  constructor(
    private readonly keyValuePairService: KeyValuePairService<ConnectedAccountKeyValueType>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @OnEvent('connectedAccount.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>,
  ) {
    const workspaceMemberId = payload.properties.before.accountOwnerId;
    const workspaceId = payload.workspaceId;
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkspaceMemberWorkspaceEntity,
      );
    const workspaceMember = await workspaceMemberRepository.findOneOrFail({
      where: { id: workspaceMemberId },
    });

    const userId = workspaceMember.userId;

    const connectedAccountId = payload.properties.before.id;

    const accountsToReconnect = await this.keyValuePairService.get({
      userId,
      workspaceId,
      key: ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT,
    });

    if (!accountsToReconnect) {
      return;
    }

    const updatedAccountsToReconnect = accountsToReconnect.filter(
      (id) => id !== connectedAccountId,
    );

    if (updatedAccountsToReconnect.length === 0) {
      await this.keyValuePairService.delete({
        userId,
        workspaceId,
        key: ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT,
      });

      return;
    }

    await this.keyValuePairService.set({
      userId,
      workspaceId,
      key: ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT,
      value: updatedAccountsToReconnect,
    });
  }
}
