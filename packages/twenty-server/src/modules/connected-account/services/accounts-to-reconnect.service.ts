import { Injectable } from '@nestjs/common';

import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import {
  type AccountsToReconnectKeyValueType,
  AccountsToReconnectKeys,
} from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class AccountsToReconnectService {
  constructor(
    private readonly userVarsService: UserVarsService<AccountsToReconnectKeyValueType>,
  ) {}

  public async removeAccountToReconnect(
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
    for (const key of Object.values(AccountsToReconnectKeys)) {
      await this.removeAccountToReconnectByKey(
        key,
        userId,
        workspaceId,
        connectedAccountId,
      );
    }
  }

  private async removeAccountToReconnectByKey(
    key: AccountsToReconnectKeys,
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

  public async addAccountToReconnectByKey(
    key: AccountsToReconnectKeys,
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
    const accountsToReconnect =
      (await this.userVarsService.get({
        userId,
        workspaceId,
        key,
      })) ?? [];

    if (accountsToReconnect.includes(connectedAccountId)) {
      return;
    }

    accountsToReconnect.push(connectedAccountId);

    await this.userVarsService.set({
      userId,
      workspaceId,
      key,
      value: accountsToReconnect,
    });
  }
}
