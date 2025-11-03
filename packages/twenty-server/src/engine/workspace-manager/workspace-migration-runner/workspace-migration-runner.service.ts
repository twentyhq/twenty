import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, type QueryRunner, Table, type TableColumn } from 'typeorm';

import {
  IndexMetadataException,
  IndexMetadataExceptionCode,
} from 'src/engine/metadata-modules/index-metadata/index-field-metadata.exception';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import {
  type WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnCreate,
  type WorkspaceMigrationForeignTable,
  type WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationColumnService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-column.service';
import { type PostgresQueryRunner } from 'src/engine/workspace-manager/workspace-migration-runner/types/postgres-query-runner.type';
import { tableDefaultColumns } from 'src/engine/workspace-manager/workspace-migration-runner/utils/table-default-column.util';

export const RELATION_MIGRATION_PRIORITY_PREFIX = '1000';

@Injectable()
export class WorkspaceMigrationRunnerService {
  private readonly logger = new Logger(WorkspaceMigrationRunnerService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationColumnService: WorkspaceMigrationColumnService,
  ) {}

  public async executeMigrationFromPendingMigrationsWithinTransaction(
    workspaceId: string,
    transactionQueryRunner: QueryRunner,
  ): Promise<WorkspaceMigrationTableAction[]> {
    const pendingMigrations =
      await this.workspaceMigrationService.getPendingMigrations(
        workspaceId,
        transactionQueryRunner,
      );

    if (pendingMigrations.length === 0) {
      return [];
    }

    const migrationActionsWithParent = pendingMigrations.flatMap(
      (pendingMigration) =>
        (pendingMigration.migrations || []).map((tableAction) => ({
          tableAction,
          parentMigrationId: pendingMigration.id,
        })),
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await transactionQueryRunner.query(
      `SET LOCAL search_path TO ${schemaName}`,
    );

    // temporary fix to skip view migrations issue during upgrade 1.8 -> 1.10
    const migrationActionsWithParentTmp = [
      ...migrationActionsWithParent.filter(
        ({ tableAction }) => tableAction.name !== 'view',
      ),
      ...migrationActionsWithParent.filter(
        ({ tableAction }) => tableAction.name === 'view',
      ),
    ];

    for (const {
      tableAction,
      parentMigrationId,
    } of migrationActionsWithParentTmp) {
      await this.handleTableChanges(
        transactionQueryRunner as PostgresQueryRunner,
        schemaName,
        tableAction,
      );

      await transactionQueryRunner.query(
        `UPDATE "core"."workspaceMigration" SET "appliedAt" = NOW() WHERE "id" = $1 AND "workspaceId" = $2`,
        [parentMigrationId, workspaceId],
      );
    }

    return migrationActionsWithParentTmp.map((item) => item.tableAction);
  }

  public async executeMigrationFromPendingMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationTableAction[]> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result =
        await this.executeMigrationFromPendingMigrationsWithinTransaction(
          workspaceId,
          queryRunner,
        );

      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      this.logger.error(
        `Error executing migration: ${error.message}`,
        error.stack,
      );
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleTableChanges(
    queryRunner: PostgresQueryRunner,
    schemaName: string,
    tableMigration: WorkspaceMigrationTableAction,
  ) {
    switch (tableMigration.action) {
      case WorkspaceMigrationTableActionType.CREATE:
        await this.createTable(
          queryRunner,
          schemaName,
          tableMigration.name,
          tableMigration.columns,
        );
        break;
      case WorkspaceMigrationTableActionType.ALTER: {
        if (tableMigration.newName) {
          await this.renameTable(
            queryRunner,
            schemaName,
            tableMigration.name,
            tableMigration.newName,
          );

          break;
        }

        if (tableMigration.columns && tableMigration.columns.length > 0) {
          await this.workspaceMigrationColumnService.handleColumnChanges(
            queryRunner,
            schemaName,
            tableMigration.newName ?? tableMigration.name,
            tableMigration.columns,
          );

          break;
        }

        break;
      }
      case WorkspaceMigrationTableActionType.DROP:
        await queryRunner.dropTable(`${schemaName}.${tableMigration.name}`);
        break;
      case 'create_foreign_table':
        await this.createForeignTable(
          queryRunner,
          schemaName,
          tableMigration.name,
          tableMigration?.foreignTable,
        );
        break;
      case 'drop_foreign_table':
        await queryRunner.query(
          `DROP FOREIGN TABLE ${schemaName}."${tableMigration.name}"`,
        );
        break;
      case WorkspaceMigrationTableActionType.ALTER_FOREIGN_TABLE:
        await this.alterForeignTable(
          queryRunner,
          schemaName,
          tableMigration.name,
          tableMigration.columns,
        );
        break;

      case WorkspaceMigrationTableActionType.ALTER_INDEXES:
        if (tableMigration.indexes && tableMigration.indexes.length > 0) {
          const tableName = tableMigration.newName ?? tableMigration.name;

          await this.handleIndexesChanges(
            queryRunner,
            schemaName,
            tableName,
            tableMigration.indexes,
          );
        }
        break;
      default:
        throw new Error(
          `Migration table action ${tableMigration.action} not supported`,
        );
    }
  }

  private async handleIndexesChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    indexes: WorkspaceMigrationIndexAction[],
  ) {
    for (const index of indexes) {
      switch (index.action) {
        case WorkspaceMigrationIndexActionType.CREATE:
          await this.createIndex(queryRunner, schemaName, tableName, index);
          break;
        case WorkspaceMigrationIndexActionType.DROP:
          await this.dropIndex(queryRunner, schemaName, tableName, index.name);
          break;
        default:
          throw new Error(`Migration index action not supported`);
      }
    }
  }

  private async createIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    index: WorkspaceMigrationIndexAction,
  ) {
    try {
      if (isDefined(index.type) && index.type !== IndexType.BTREE) {
        const quotedColumns = index.columns.map((column) => `"${column}"`);

        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "${index.name}" ON "${schemaName}"."${tableName}" USING ${index.type} (${quotedColumns.join(', ')})
        `);
      } else {
        const quotedColumns = index.columns.map((column) => `"${column}"`);
        const isUnique = index.isUnique ? 'UNIQUE' : '';
        const whereClause = index.where ? `WHERE ${index.where}` : '';

        await queryRunner.query(`
          CREATE ${isUnique} INDEX IF NOT EXISTS "${index.name}" ON "${schemaName}"."${tableName}" (${quotedColumns.join(', ')}) ${whereClause}
        `);
      }
    } catch (error) {
      // Ignore error if index already exists
      if (error.code === '42P07') {
        return;
      }

      if (error.code === '23505') {
        throw new IndexMetadataException(
          `Unique index creation failed because of unique constraint violation`,
          IndexMetadataExceptionCode.INDEX_CREATION_FAILED,
          {
            userFriendlyMessage: msg`Cannot enable uniqueness due to existing duplicate values. Please review and fix your data first (including soft deleted records).`,
          },
        );
      }

      throw error;
    }
  }

  private async dropIndex(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    indexName: string,
  ) {
    try {
      await queryRunner.dropIndex(`${schemaName}.${tableName}`, indexName);
    } catch (error) {
      // Ignore error if index does not exist
      if (
        error.message ===
        `Supplied index ${indexName} was not found in table ${schemaName}.${tableName}`
      ) {
        return;
      }
      throw error;
    }
  }

  private async createTable(
    queryRunner: PostgresQueryRunner,
    schemaName: string,
    tableName: string,
    columns?: WorkspaceMigrationColumnAction[],
  ) {
    const tableColumns: TableColumn[] = [];

    if (columns && columns.length > 0) {
      const createColumns = columns.filter(
        (column) => column.action === WorkspaceMigrationColumnActionType.CREATE,
      ) as WorkspaceMigrationColumnCreate[];

      for (const column of createColumns) {
        tableColumns.push(
          this.workspaceMigrationColumnService.createTableColumnFromMigration(
            tableName,
            column,
          ),
        );
      }
    }

    await queryRunner.createTable(
      new Table({
        name: tableName,
        schema: schemaName,
        columns: tableColumns.length > 0 ? tableColumns : tableDefaultColumns(),
      }),
      true,
    );

    if (columns && columns.length > 0) {
      const nonCreateColumns = columns.filter(
        (column) => column.action !== WorkspaceMigrationColumnActionType.CREATE,
      );

      if (nonCreateColumns.length > 0) {
        await this.workspaceMigrationColumnService.handleColumnChanges(
          queryRunner,
          schemaName,
          tableName,
          nonCreateColumns,
        );
      }
    }
  }

  private async renameTable(
    queryRunner: QueryRunner,
    schemaName: string,
    oldTableName: string,
    newTableName: string,
  ) {
    await queryRunner.renameTable(
      `${schemaName}.${oldTableName}`,
      newTableName,
    );
  }

  private async createForeignTable(
    queryRunner: QueryRunner,
    schemaName: string,
    name: string,
    foreignTable: WorkspaceMigrationForeignTable | undefined,
  ) {
    if (!foreignTable) {
      return;
    }

    const foreignTableColumns = foreignTable.columns
      .map(
        (column) =>
          `"${column.columnName}" ${column.columnType} OPTIONS (column_name '${column.distantColumnName}')`,
      )
      .join(', ');

    const serverOptions = Object.entries(foreignTable.referencedTable)
      .map(([key, value]) => `${key} '${value}'`)
      .join(', ');

    await queryRunner.query(
      `CREATE FOREIGN TABLE ${schemaName}."${name}" (${foreignTableColumns}) SERVER "${foreignTable.foreignDataWrapperId}" OPTIONS (${serverOptions})`,
    );

    await queryRunner.query(`
      COMMENT ON FOREIGN TABLE "${schemaName}"."${name}" IS '@graphql({"primary_key_columns": ["id"], "totalCount": {"enabled": true}})';
    `);
  }

  private async alterForeignTable(
    queryRunner: QueryRunner,
    schemaName: string,
    name: string,
    columns: WorkspaceMigrationColumnAction[] | undefined,
  ) {
    const columnUpdatesQuery = columns
      ?.map((column) => {
        switch (column.action) {
          case WorkspaceMigrationColumnActionType.DROP:
            return `DROP COLUMN "${column.columnName}"`;
          case WorkspaceMigrationColumnActionType.CREATE:
            return `ADD COLUMN "${column.columnName}" ${column.columnType}`;
          default:
            return '';
        }
      })
      .filter(Boolean)
      .join(', ');

    await queryRunner.query(
      `ALTER FOREIGN TABLE ${schemaName}."${name}" ${columnUpdatesQuery};`,
    );
  }
}
