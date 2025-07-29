import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import {
  WorkspaceSchemaColumnManager,
  WorkspaceSchemaEnumManager,
  WorkspaceSchemaForeignKeyManager,
  WorkspaceSchemaIndexManager,
  WorkspaceSchemaTableManager,
} from 'src/engine/twenty-orm/workspace-schema-manager/services';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaManager {
  public readonly tableManager: WorkspaceSchemaTableManager;
  public readonly columnManager: WorkspaceSchemaColumnManager;
  public readonly indexManager: WorkspaceSchemaIndexManager;
  public readonly enumManager: WorkspaceSchemaEnumManager;
  public readonly foreignKeyManager: WorkspaceSchemaForeignKeyManager;

  constructor(
    workspaceSchemaTableManager: WorkspaceSchemaTableManager,
    workspaceSchemaColumnManager: WorkspaceSchemaColumnManager,
    workspaceSchemaIndexManager: WorkspaceSchemaIndexManager,
    workspaceSchemaEnumManager: WorkspaceSchemaEnumManager,
    workspaceSchemaForeignKeyManager: WorkspaceSchemaForeignKeyManager,
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
