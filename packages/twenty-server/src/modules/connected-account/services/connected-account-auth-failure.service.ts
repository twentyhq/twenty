import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';

@Injectable()
export class ConnectedAccountAuthFailureService {
  private readonly logger = new Logger(ConnectedAccountAuthFailureService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly accountsToReconnectService: AccountsToReconnectService,
  ) {}

  async markAuthFailed({
    connectedAccountId,
    workspaceId,
  }: {
    connectedAccountId: string;
    workspaceId: string;
  }): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId, workspaceId },
      select: ['id', 'userWorkspaceId'],
    });

    if (!isDefined(connectedAccount)) {
      return;
    }

    await this.connectedAccountRepository.update(
      { id: connectedAccount.id, workspaceId },
      { authFailedAt: new Date() },
    );

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { id: connectedAccount.userWorkspaceId },
      select: ['userId'],
    });

    if (!isDefined(userWorkspace)) {
      return;
    }

    await this.accountsToReconnectService.addAccountToReconnectByKey(
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      userWorkspace.userId,
      workspaceId,
      connectedAccount.id,
    );

    this.logger.warn(
      `Connected account ${connectedAccount.id} in workspace ${workspaceId} requires re-authentication`,
    );
  }
}
