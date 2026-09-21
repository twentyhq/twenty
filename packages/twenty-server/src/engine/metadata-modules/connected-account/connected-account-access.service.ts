import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsRelations, IsNull, Repository } from 'typeorm';

import { type ConnectedAccountOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformOperation,
  isDefined,
  isValidUuid,
} from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildUnsupportedOperationMessage } from 'src/engine/metadata-modules/connected-account/utils/build-unsupported-operation-message.util';
import { canActorActAsConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-act-as-connected-account.util';
import { canActorSeeConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-see-connected-account.util';
import { selectDefaultConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/select-default-connected-account.util';

const LISTED_CONNECTED_ACCOUNT_COLUMNS = {
  id: true,
  handle: true,
  handleAliases: true,
  provider: true,
  name: true,
  scopes: true,
  visibility: true,
  userWorkspaceId: true,
  applicationId: true,
  connectionParameters: true,
} as const;

@Injectable()
export class ConnectedAccountAccessService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async listVisibleConnectedAccounts({
    authContext,
    operation,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.findConnectedAccountsForOperation({
      authContext,
      operation,
    });

    return connectedAccounts.filter((connectedAccount) =>
      canActorSeeConnectedAccount({ authContext, connectedAccount }),
    );
  }

  async listActableConnectedAccounts({
    authContext,
    operation,
    relations,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.findConnectedAccountsForOperation({
      authContext,
      operation,
      relations,
    });

    return connectedAccounts.filter((connectedAccount) =>
      canActorActAsConnectedAccount({ authContext, connectedAccount }),
    );
  }

  private async findConnectedAccountsForOperation({
    authContext,
    operation,
    relations,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        workspaceId: authContext.workspace.id,
        archivedAt: IsNull(),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
      ...(isDefined(relations)
        ? { relations }
        : { select: LISTED_CONNECTED_ACCOUNT_COLUMNS }),
    });

    return connectedAccounts.filter((connectedAccount) =>
      canConnectedAccountPerformOperation({ connectedAccount, operation }),
    );
  }

  async listConnectedAccountsRequiringReconnect({
    authContext,
    operation,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        workspaceId: authContext.workspace.id,
        archivedAt: IsNull(),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
      select: LISTED_CONNECTED_ACCOUNT_COLUMNS,
    });

    return connectedAccounts.filter(
      (connectedAccount) =>
        canActorActAsConnectedAccount({ authContext, connectedAccount }) &&
        !canConnectedAccountPerformOperation({ connectedAccount, operation }),
    );
  }

  async getActableConnectedAccountOrThrow({
    authContext,
    connectedAccountId,
    operation,
    relations,
  }: {
    authContext: WorkspaceAuthContext;
    connectedAccountId: string;
    operation: ConnectedAccountOperation;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity> {
    if (!isValidUuid(connectedAccountId)) {
      throw new ConnectedAccountException(
        `Connected account id is not a valid UUID`,
        ConnectedAccountExceptionCode.INVALID_CONNECTED_ACCOUNT_INPUT,
      );
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        id: connectedAccountId,
        workspaceId: authContext.workspace.id,
        archivedAt: IsNull(),
      },
      relations,
    });

    if (!isDefined(connectedAccount)) {
      throw new ConnectedAccountException(
        `No connected account found for id '${connectedAccountId}'`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    if (!canActorActAsConnectedAccount({ authContext, connectedAccount })) {
      throw new ConnectedAccountException(
        `Connected account ${connectedAccountId} is not usable by this caller`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION,
      );
    }

    if (!canConnectedAccountPerformOperation({ connectedAccount, operation })) {
      throw new ConnectedAccountException(
        buildUnsupportedOperationMessage({
          connectedAccount,
          operation,
        }),
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_CANNOT_PERFORM_OPERATION,
      );
    }

    return connectedAccount;
  }

  async selectDefaultConnectedAccountOrThrow({
    authContext,
    operation,
    relations,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity> {
    const actableConnectedAccounts = await this.listActableConnectedAccounts({
      authContext,
      operation,
    });

    const connectedAccount = selectDefaultConnectedAccount({
      authContext,
      connectedAccounts: actableConnectedAccounts,
    });

    if (!isDefined(connectedAccount)) {
      throw new ConnectedAccountException(
        `No connected account available to this caller can perform ${operation}`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_CANNOT_PERFORM_OPERATION,
      );
    }

    if (!isDefined(relations)) {
      return connectedAccount;
    }

    return this.getActableConnectedAccountOrThrow({
      authContext,
      connectedAccountId: connectedAccount.id,
      operation,
      relations,
    });
  }
}
