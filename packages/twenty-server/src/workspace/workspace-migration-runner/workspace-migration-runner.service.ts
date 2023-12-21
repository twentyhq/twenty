import { Injectable } from '@nestjs/common';

import {
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnRelation,
  WorkspaceMigrationColumnAlter,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceCacheVersionService } from 'src/metadata/workspace-cache-version/workspace-cache-version.service';
import { WorkspaceMigrationEnumService } from 'src/workspace/workspace-migration-runner/services/workspace-migration-enum.service';

import { customTableDefaultColumns } from './utils/custom-table-default-column.util';

@Injectable()
export class WorkspaceMigrationRunnerService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly workspaceMigrationEnumService: WorkspaceMigrationEnumService,
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
    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    // Loop over each migration and create or update the table
    // TODO: Should be done in a transaction
    for (const migration of flattenedPendingMigrations) {
      await this.handleTableChanges(queryRunner, schemaName, migration);
    }

    // Update appliedAt date for each migration
    // TODO: Should be done after the migration is successful
    for (const pendingMigration of pendingMigrations) {
      await this.workspaceMigrationService.setAppliedAtForMigration(
        workspaceId,
        pendingMigration,
      );
    }

    await queryRunner.release();

    // Increment workspace cache version
    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

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
      case 'create':
        await this.createTable(queryRunner, schemaName, tableMigration.name);
        break;
      case 'alter':
        await this.handleColumnChanges(
          queryRunner,
          schemaName,
          tableMigration.name,
          tableMigration?.columns,
        );
        break;
      default:
        throw new Error(
          `Migration table action ${tableMigration.action} not supported`,
        );
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
        case WorkspaceMigrationColumnActionType.RELATION:
          await this.createRelation(
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

    await queryRunner.addColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: migrationColumn.columnName,
        type: migrationColumn.columnType,
        default: migrationColumn.defaultValue,
        enum: migrationColumn.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
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
      // This is returning the old enum values to avoid TypeORM droping the enum type
      await this.workspaceMigrationEnumService.alterEnum(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn,
      );
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
    migrationColumn: WorkspaceMigrationColumnRelation,
  ) {
    await queryRunner.createForeignKey(
      `${schemaName}.${tableName}`,
      new TableForeignKey({
        columnNames: [migrationColumn.columnName],
        referencedColumnNames: [migrationColumn.referencedTableColumnName],
        referencedTableName: migrationColumn.referencedTableName,
        onDelete: 'CASCADE',
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
}
