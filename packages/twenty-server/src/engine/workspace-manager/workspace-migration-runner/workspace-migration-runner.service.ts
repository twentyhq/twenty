import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { QueryRunner, Table, TableColumn } from 'typeorm';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationForeignTable,
  WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMigrationColumnService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-column.service';
import { PostgresQueryRunner } from 'src/engine/workspace-manager/workspace-migration-runner/types/postgres-query-runner.type';
import { tableDefaultColumns } from 'src/engine/workspace-manager/workspace-migration-runner/utils/table-default-column.util';

export const RELATION_MIGRATION_PRIORITY_PREFIX = '1000';

@Injectable()
export class WorkspaceMigrationRunnerService {
  private readonly logger = new Logger(WorkspaceMigrationRunnerService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationColumnService: WorkspaceMigrationColumnService,
  ) {}

  public async executeMigrationFromPendingMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationTableAction[]> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    if (!mainDataSource) {
      throw new Error('Main data source not found');
    }

    const pendingMigrations =
      await this.workspaceMigrationService.getPendingMigrations(workspaceId);

    if (pendingMigrations.length === 0) {
      return [];
    }

    const flattenedPendingMigrations: WorkspaceMigrationTableAction[] =
      pendingMigrations.reduce((acc, pendingMigration) => {
        return [...acc, ...pendingMigration.migrations];
      }, []);

    const queryRunner =
      mainDataSource.createQueryRunner() as PostgresQueryRunner;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await queryRunner.query(`SET LOCAL search_path TO ${schemaName}`);

    try {
      // Loop over each migration and create or update the table
      for (const migration of flattenedPendingMigrations) {
        await this.handleTableChanges(queryRunner, schemaName, migration);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(
        `Error executing migration: ${error.message}`,
        error.stack,
      );

      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Update appliedAt date for each migration
    // TODO: Should be done after the migration is successful
    for (const pendingMigration of pendingMigrations) {
      await this.workspaceMigrationService.setAppliedAtForMigration(
        workspaceId,
        pendingMigration,
      );
    }

    return flattenedPendingMigrations;
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
          await this.handleIndexesChanges(
            queryRunner,
            schemaName,
            tableMigration.newName ?? tableMigration.name,
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
