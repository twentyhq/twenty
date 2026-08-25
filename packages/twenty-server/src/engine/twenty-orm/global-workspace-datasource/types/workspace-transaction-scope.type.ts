import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';

export type WorkspaceTransactionScope = {
  getRepository: <T extends ObjectLiteral = ObjectRecord>(
    objectMetadataName: string,
    rolePermissionConfig?: RolePermissionConfig,
  ) => WorkspaceRepositoryV2<T>;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};
