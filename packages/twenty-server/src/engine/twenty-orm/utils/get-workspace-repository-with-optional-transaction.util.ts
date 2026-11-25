import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

export const getWorkspaceRepositoryWithOptionalTransaction = <
  Entity extends ObjectLiteral,
>({
  objectMetadataName,
  transactionScope,
  workspaceOrmManager,
  shouldBypassPermissionChecks = false,
}: {
  objectMetadataName: string;
  transactionScope?: WorkspaceTransactionScope;
  workspaceOrmManager: WorkspaceOrmManager;
  shouldBypassPermissionChecks?: boolean;
}): WorkspaceRepository<Entity> => {
  const repositorySource = transactionScope ?? workspaceOrmManager;

  return shouldBypassPermissionChecks
    ? repositorySource.getRepositoryWithoutPermissionChecks<Entity>(
        objectMetadataName,
      )
    : repositorySource.getRepository<Entity>(objectMetadataName);
};
