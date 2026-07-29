import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  type AccountsToReconnectKeyValueType,
  AccountsToReconnectKeys,
} from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class AccountsToReconnectService {
  constructor(
    private readonly userVarsService: UserVarsService<AccountsToReconnectKeyValueType>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  public async markAccountForReconnect(
    connectedAccountId: string,
    workspaceId: string,
  ) {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId, workspaceId },
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    await this.connectedAccountRepository.update(
      { id: connectedAccountId, workspaceId },
      { authFailedAt: new Date() },
    );

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: connectedAccount.userWorkspaceId },
      select: ['userId'],
    });

    if (!isDefined(userWorkspace)) {
      return;
    }

    await this.addAccountToReconnectByKey(
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      userWorkspace.userId,
      workspaceId,
      connectedAccountId,
    );
  }

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
