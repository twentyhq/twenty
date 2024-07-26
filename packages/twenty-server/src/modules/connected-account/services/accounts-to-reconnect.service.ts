import { Injectable } from '@nestjs/common';

import { UserVarService } from 'src/engine/core-modules/user/services/user-var.service';
import {
  ConnectedAccountKeys,
  ConnectedAccountKeyValueType,
} from 'src/modules/connected-account/types/connected-account-key-value.type';

@Injectable()
export class AccountsToReconnectService {
  constructor(
    private readonly userVarService: UserVarService<ConnectedAccountKeyValueType>,
  ) {}

  public async removeAccountToReconnect(
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
    const accountsToReconnect = await this.userVarService.get({
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
      await this.userVarService.delete({
        userId,
        workspaceId,
        key: ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT,
      });

      return;
    }

    await this.userVarService.set({
      userId,
      workspaceId,
      key: ConnectedAccountKeys.ACCOUNTS_TO_RECONNECT,
      value: updatedAccountsToReconnect,
    });
  }
}
