import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export type WorkspaceTransactionScope = {
  getRepository: <T extends ObjectLiteral = ObjectRecord>(
    objectMetadataName: string,
    rolePermissionConfig?: RolePermissionConfig,
  ) => WorkspaceRepository<T>;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};
