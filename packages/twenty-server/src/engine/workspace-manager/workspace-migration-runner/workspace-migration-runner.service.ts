import { Injectable } from '@nestjs/common';

import {
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnCreateRelation,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnDropRelation,
  WorkspaceMigrationTableActionType,
  WorkspaceMigrationForeignTable,
  WorkspaceMigrationIndexAction,
  WorkspaceMigrationIndexActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceMigrationEnumService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-enum.service';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration-runner/utils/convert-on-delete-action-to-on-delete.util';

import { customTableDefaultColumns } from './utils/custom-table-default-column.util';
import { WorkspaceMigrationTypeService } from './services/workspace-migration-type.service';

@Injectable()
export class WorkspaceMigrationRunnerService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly workspaceMigrationEnumService: WorkspaceMigrationEnumService,
    private readonly workspaceMigrationTypeService: WorkspaceMigrationTypeService,
  ) {}

  /**
   * Executes pending migrations for a given workspace
   *
   * @param workspaceId string
   * @returns Promise<WorkspaceMigrationTableAction[]>
   */
  public async executeMigrationFromPendingMigrations(
    workspaceId: string,
  ): Promise<WorkspaceMigrationTableAction[]> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
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

    const queryRunner = workspaceDataSource?.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    try {
      // Loop over each migration and create or update the table
      for (const migration of flattenedPendingMigrations) {
        await this.handleTableChanges(queryRunner, schemaName, migration);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error executing migration', error);
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

  /**
   * Handles table changes for a given migration
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableMigration WorkspaceMigrationTableChange
   */
  private async handleTableChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableMigration: WorkspaceMigrationTableAction,
  ) {
    switch (tableMigration.action) {
      case WorkspaceMigrationTableActionType.CREATE:
        await this.createTable(queryRunner, schemaName, tableMigration.name);
        break;
      case WorkspaceMigrationTableActionType.ALTER: {
        if (tableMigration.newName) {
          await this.renameTable(
            queryRunner,
            schemaName,
            tableMigration.name,
            tableMigration.newName,
          );
        }

        if (tableMigration.columns && tableMigration.columns.length > 0) {
          await this.handleColumnChanges(
            queryRunner,
            schemaName,
            tableMigration.newName ?? tableMigration.name,
            tableMigration.columns,
          );
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
          await queryRunner.createIndex(
            `${schemaName}.${tableName}`,
            new TableIndex({
              name: index.name,
              columnNames: index.columns,
            }),
          );
          break;
        case WorkspaceMigrationIndexActionType.DROP:
          await queryRunner.dropIndex(`${schemaName}.${tableName}`, index.name);
          break;
        default:
          throw new Error(`Migration index action not supported`);
      }
    }
  }

  /**
   * Creates a table for a given schema and table name
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableName string
   */
  private async createTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ) {
    await queryRunner.createTable(
      new Table({
        name: tableName,
        schema: schemaName,
        columns: customTableDefaultColumns,
      }),
      true,
    );

    // Enable totalCount for the table
    await queryRunner.query(`
      COMMENT ON TABLE "${schemaName}"."${tableName}" IS '@graphql({"totalCount": {"enabled": true}})';
    `);
  }

  /**
   * Rename a table
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param oldTableName string
   * @param newTableName string
   */
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

  /**
   * Handles column changes for a given migration
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableName string
   * @param columnMigrations WorkspaceMigrationColumnAction[]
   * @returns
   */
  private async handleColumnChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnMigrations?: WorkspaceMigrationColumnAction[],
  ) {
    if (!columnMigrations || columnMigrations.length === 0) {
      return;
    }

    for (const columnMigration of columnMigrations) {
      switch (columnMigration.action) {
        case WorkspaceMigrationColumnActionType.CREATE:
          await this.createColumn(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case WorkspaceMigrationColumnActionType.ALTER:
          await this.alterColumn(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY:
          await this.createRelation(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY:
          await this.dropRelation(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case WorkspaceMigrationColumnActionType.DROP:
          await queryRunner.dropColumn(
            `${schemaName}.${tableName}`,
            columnMigration.columnName,
          );
          break;
        case WorkspaceMigrationColumnActionType.CREATE_COMMENT:
          await this.createComment(
            queryRunner,
            schemaName,
            tableName,
            columnMigration.comment,
          );
          break;
        default:
          throw new Error(`Migration column action not supported`);
      }
    }
  }

  /**
   * Creates a column for a given schema, table name, and column migration
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableName string
   * @param migrationColumn WorkspaceMigrationColumnAction
   */
  private async createColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnCreate,
  ) {
    const hasColumn = await queryRunner.hasColumn(
      `${schemaName}.${tableName}`,
      migrationColumn.columnName,
    );

    if (hasColumn) {
      return;
    }

    const enumName = `${tableName}_${migrationColumn.columnName}_enum`;

    await queryRunner.addColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: migrationColumn.columnName,
        type: migrationColumn.columnType,
        default: migrationColumn.defaultValue,
        enum: migrationColumn.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        enumName: enumName,
        isArray: migrationColumn.isArray,
        isNullable: migrationColumn.isNullable,
      }),
    );
  }

  private async alterColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const enumValues = migrationColumn.alteredColumnDefinition.enum;

    // TODO: Maybe we can do something better if we can recreate the old `TableColumn` object
    if (enumValues) {
      // This is returning the old enum values to avoid TypeORM dropping the enum type
      await this.workspaceMigrationEnumService.alterEnum(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn,
      );

      return;
    }

    if (
      migrationColumn.currentColumnDefinition.columnType !==
      migrationColumn.alteredColumnDefinition.columnType
    ) {
      await this.workspaceMigrationTypeService.alterType(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn,
      );

      migrationColumn.currentColumnDefinition.columnType =
        migrationColumn.alteredColumnDefinition.columnType;

      return;
    }

    await queryRunner.changeColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: migrationColumn.currentColumnDefinition.columnName,
        type: migrationColumn.currentColumnDefinition.columnType,
        default: migrationColumn.currentColumnDefinition.defaultValue,
        enum: migrationColumn.currentColumnDefinition.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        isArray: migrationColumn.currentColumnDefinition.isArray,
        isNullable: migrationColumn.currentColumnDefinition.isNullable,
      }),
      new TableColumn({
        name: migrationColumn.alteredColumnDefinition.columnName,
        type: migrationColumn.alteredColumnDefinition.columnType,
        default: migrationColumn.alteredColumnDefinition.defaultValue,
        enum: migrationColumn.currentColumnDefinition.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        isArray: migrationColumn.alteredColumnDefinition.isArray,
        isNullable: migrationColumn.alteredColumnDefinition.isNullable,
      }),
    );
  }

  private async createRelation(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnCreateRelation,
  ) {
    await queryRunner.createForeignKey(
      `${schemaName}.${tableName}`,
      new TableForeignKey({
        columnNames: [migrationColumn.columnName],
        referencedColumnNames: [migrationColumn.referencedTableColumnName],
        referencedTableName: migrationColumn.referencedTableName,
        referencedSchema: schemaName,
        onDelete: convertOnDeleteActionToOnDelete(migrationColumn.onDelete),
      }),
    );

    // Create unique constraint if for one to one relation
    if (migrationColumn.isUnique) {
      await queryRunner.createUniqueConstraint(
        `${schemaName}.${tableName}`,
        new TableUnique({
          name: `UNIQUE_${tableName}_${migrationColumn.columnName}`,
          columnNames: [migrationColumn.columnName],
        }),
      );
    }
  }

  private async dropRelation(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnDropRelation,
  ) {
    const foreignKeyName = await this.getForeignKeyName(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn.columnName,
    );

    if (!foreignKeyName) {
      throw new Error(
        `Foreign key not found for column ${migrationColumn.columnName}`,
      );
    }

    await queryRunner.dropForeignKey(
      `${schemaName}.${tableName}`,
      foreignKeyName,
    );
  }

  private async getForeignKeyName(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<string | undefined> {
    const foreignKeys = await queryRunner.query(
      `
      SELECT
        tc.constraint_name AS constraint_name
      FROM
        information_schema.table_constraints AS tc
      JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
        AND kcu.column_name = $3
    `,
      [schemaName, tableName, columnName],
    );

    return foreignKeys[0]?.constraint_name;
  }

  private async createComment(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    comment: string,
  ) {
    await queryRunner.query(`
      COMMENT ON TABLE "${schemaName}"."${tableName}" IS e'${comment}';
    `);
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
