import { type ObjectLiteral } from 'typeorm';

import { type ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceRepositoryOptions } from 'src/engine/twenty-orm/types/workspace-repository-options.type';

export type WorkspaceTransactionScope = {
  workspaceId: string;
  getRepository: <T extends ObjectLiteral = ObjectRecord>(
    objectMetadataName: string,
    repositoryOptions?: WorkspaceRepositoryOptions,
  ) => WorkspaceRepository<T>;
  getRepositoryWithoutPermissionChecks: <
    T extends ObjectLiteral = ObjectRecord,
  >(
    objectMetadataName: string,
    repositoryOptions?: WorkspaceRepositoryOptions,
  ) => WorkspaceRepository<T>;
  executeRawQuery: (
    sql: string,
    parameters?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
  afterCommit: (callback: () => void | Promise<void>) => void;
};
