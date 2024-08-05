import { Injectable } from '@nestjs/common';

import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import {
  ConnectedAccountKeys,
  ConnectedAccountKeyValueType,
} from 'src/modules/connected-account/types/connected-account-key-value.type';

@Injectable()
export class AccountsToReconnectService {
  constructor(
    private readonly userVarsService: UserVarsService<ConnectedAccountKeyValueType>,
  ) {}

  public async removeAccountToReconnect(
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
    for (const key of Object.values(ConnectedAccountKeys)) {
      await this.removeAccountToReconnectByKey(
        key,
        userId,
        workspaceId,
        connectedAccountId,
      );
    }
  }

  public async removeAccountToReconnectByKey(
    key: ConnectedAccountKeys,
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
    const accountsToReconnect = await this.userVarsService.get({
      userId,
      workspaceId,
      key,
    });

    if (!accountsToReconnect) {
      return;
    }

    const updatedAccountsToReconnect = accountsToReconnect.filter(
      (id) => id !== connectedAccountId,
    );

    if (updatedAccountsToReconnect.length === 0) {
      await this.userVarsService.delete({
        userId,
        workspaceId,
        key,
      });

      return;
    }

    await this.userVarsService.set({
      userId,
      workspaceId,
      key,
      value: updatedAccountsToReconnect,
    });
  }
}
