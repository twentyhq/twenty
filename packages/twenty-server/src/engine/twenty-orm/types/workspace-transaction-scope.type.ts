import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';

import { type RepositoryPermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export type WorkspaceTransactionScope = {
  workspaceId: string;
  getRepository: <T extends ObjectLiteral = ObjectRecord>(
    objectMetadataName: string,
    rolePermissionConfig?: RepositoryPermissionConfig,
    repositoryOptions?: { shouldSkipEventEmission?: boolean },
  ) => WorkspaceRepository<T>;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
  afterCommit: (callback: () => void | Promise<void>) => void;
};
