import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type WorkspaceTransactionScope = {
  getRepository: <Entity extends ObjectLiteral>(
    objectMetadataName: string,
    rolePermissionConfig?: RolePermissionConfig,
  ) => WorkspaceRepository<Entity>;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
};
