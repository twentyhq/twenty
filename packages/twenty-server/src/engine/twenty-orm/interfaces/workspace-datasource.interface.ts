import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import {
  type EntityManager,
  type EntityTarget,
  type ObjectLiteral,
  type QueryRunner,
  type ReplicationMode,
} from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { type WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export interface WorkspaceDataSourceInterface {
  readonly isGlobalFlow: boolean;
  readonly manager: EntityManager;

  featureFlagMap: FeatureFlagMap;
  permissionsPerRoleId: ObjectsPermissionsByRoleId;

  getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    permissionOptions?: RolePermissionConfig,
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity>;

  createQueryRunner(mode?: ReplicationMode): WorkspaceQueryRunner;

  createEntityManager(queryRunner?: QueryRunner): WorkspaceEntityManager;

  createQueryRunnerForEntityPersistExecutor(
    mode?: ReplicationMode,
  ): QueryRunner;

  transaction<T>(
    runInTransaction: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T>;

  query<T = unknown>(
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
    options?: { shouldBypassPermissionChecks?: boolean },
  ): Promise<T>;
}
