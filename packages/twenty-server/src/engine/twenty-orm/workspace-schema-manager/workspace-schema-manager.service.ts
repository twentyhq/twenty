import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaColumnManagerService,
  WorkspaceSchemaEnumManagerService,
  WorkspaceSchemaForeignKeyManagerService,
  WorkspaceSchemaIndexManagerService,
  WorkspaceSchemaTableManagerService,
} from 'src/engine/twenty-orm/workspace-schema-manager/services';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaManagerService {
  public readonly tableManager: WorkspaceSchemaTableManagerService;
  public readonly columnManager: WorkspaceSchemaColumnManagerService;
  public readonly indexManager: WorkspaceSchemaIndexManagerService;
  public readonly enumManager: WorkspaceSchemaEnumManagerService;
  public readonly foreignKeyManager: WorkspaceSchemaForeignKeyManagerService;

  constructor(
    workspaceSchemaTableManager: WorkspaceSchemaTableManagerService,
    workspaceSchemaColumnManager: WorkspaceSchemaColumnManagerService,
    workspaceSchemaIndexManager: WorkspaceSchemaIndexManagerService,
    workspaceSchemaEnumManager: WorkspaceSchemaEnumManagerService,
    workspaceSchemaForeignKeyManager: WorkspaceSchemaForeignKeyManagerService,
  ) {
    this.tableManager = workspaceSchemaTableManager;
    this.columnManager = workspaceSchemaColumnManager;
    this.indexManager = workspaceSchemaIndexManager;
    this.enumManager = workspaceSchemaEnumManager;
    this.foreignKeyManager = workspaceSchemaForeignKeyManager;
  }

  async setSearchPath(
    queryRunner: QueryRunner,
    schemaName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);

    await queryRunner.query(`SET LOCAL search_path TO ${safeSchemaName}`);
  }
}
