import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

export const getWorkspaceRepositoryWithOptionalTransaction = <
  Entity extends ObjectLiteral,
>({
  objectMetadataName,
  transactionScope,
  workspaceOrmManager,
  rolePermissionConfig,
}: {
  objectMetadataName: string;
  transactionScope?: WorkspaceTransactionScope;
  workspaceOrmManager: WorkspaceOrmManager;
  rolePermissionConfig?: RolePermissionConfig;
}): WorkspaceRepository<Entity> =>
  isDefined(transactionScope)
    ? transactionScope.getRepository<Entity>(
        objectMetadataName,
        rolePermissionConfig,
      )
    : workspaceOrmManager.getRepository<Entity>(
        objectMetadataName,
        rolePermissionConfig,
      );
