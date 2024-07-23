import { Injectable } from '@nestjs/common';

import { KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import {
  ConnectedAccountKeys,
  ConnectedAccountKeyValueType,
} from 'src/modules/connected-account/types/connected-account-key-value.type';

@Injectable()
export class AccountsToReconnectService {
  constructor(
    private readonly keyValuePairService: KeyValuePairService<ConnectedAccountKeyValueType>,
  ) {}

  public async removeAccountToReconnect(
    userId: string,
    workspaceId: string,
    connectedAccountId: string,
  ) {
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
