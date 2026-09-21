import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type FindOptionsRelations, IsNull, Repository } from 'typeorm';

import { type ConnectedAccountOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformOperation,
  isDefined,
  isValidUuid,
} from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildUnsupportedOperationMessage } from 'src/engine/metadata-modules/connected-account/utils/build-unsupported-operation-message.util';
import { canActorActAsConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-act-as-connected-account.util';
import { canActorSeeConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/can-actor-see-connected-account.util';
import { selectDefaultConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/select-default-connected-account.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountAccessService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async listVisibleConnectedAccounts({
    authContext,
    operation,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.findConnectedAccountsForOperation({
      workspaceId: authContext.workspace.id,
      operation,
    });

    return connectedAccounts.filter((connectedAccount) =>
      canActorSeeConnectedAccount({ authContext, connectedAccount }),
    );
  }

  async listActableConnectedAccounts({
    authContext,
    operation,
  }: {
    authContext: WorkspaceAuthContext;
    operation: ConnectedAccountOperation;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.findConnectedAccountsForOperation({
      workspaceId: authContext.workspace.id,
      operation,
    });

    return connectedAccounts.filter((connectedAccount) =>
      canActorActAsConnectedAccount({ authContext, connectedAccount }),
    );
  }

  private async findWorkspaceMemberConnectedAccountId({
    workspaceId,
    senderId,
    operation,
  }: {
    workspaceId: string;
    senderId: string;
    operation: ConnectedAccountOperation;
  }): Promise<string> {
    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({ where: { id: senderId } }),
        buildSystemAuthContext(workspaceId),
      );

    if (!isDefined(workspaceMember)) {
      return senderId;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    const connectedAccounts = await this.findConnectedAccountsForOperation({
      workspaceId,
      operation,
    });

    const ownedConnectedAccount = connectedAccounts.find(
      (connectedAccount) =>
        isDefined(userWorkspace) &&
        connectedAccount.userWorkspaceId === userWorkspace.id,
    );

    if (!isDefined(ownedConnectedAccount)) {
      throw new ConnectedAccountException(
        `Workspace member '${senderId}' has no connected account that can perform ${operation}`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_CANNOT_PERFORM_OPERATION,
      );
    }

    return ownedConnectedAccount.id;
  }

  private async findConnectedAccountsForOperation({
    workspaceId,
    operation,
  }: {
    workspaceId: string;
    operation: ConnectedAccountOperation;
  }): Promise<ConnectedAccountEntity[]> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        workspaceId,
        archivedAt: IsNull(),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
      select: {
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
      },
    });

    return connectedAccounts.filter((connectedAccount) =>
      canConnectedAccountPerformOperation({ connectedAccount, operation }),
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

  async resolveConnectedAccountOrThrow({
    authContext,
    connectedAccountId,
    operation,
    relations,
  }: {
    authContext: WorkspaceAuthContext;
    connectedAccountId: string | undefined;
    operation: ConnectedAccountOperation;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity> {
    if (isNonEmptyString(connectedAccountId)) {
      return this.getActableConnectedAccountOrThrow({
        authContext,
        connectedAccountId: isValidUuid(connectedAccountId)
          ? await this.findWorkspaceMemberConnectedAccountId({
              workspaceId: authContext.workspace.id,
              senderId: connectedAccountId,
              operation,
            })
          : connectedAccountId,
        operation,
        relations,
      });
    }

    const defaultConnectedAccount = selectDefaultConnectedAccount({
      authContext,
      connectedAccounts: await this.listActableConnectedAccounts({
        authContext,
        operation,
      }),
    });

    if (!isDefined(defaultConnectedAccount)) {
      throw new ConnectedAccountException(
        `No connected account available to this caller can perform ${operation}`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_CANNOT_PERFORM_OPERATION,
      );
    }

    return this.getActableConnectedAccountOrThrow({
      authContext,
      connectedAccountId: defaultConnectedAccount.id,
      operation,
      relations,
    });
  }
}
