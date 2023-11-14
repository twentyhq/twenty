import { Injectable } from '@nestjs/common';

import {
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';
import {
  TenantMigrationTableAction,
  TenantMigrationColumnAction,
  TenantMigrationColumnActionType,
  TenantMigrationColumnCreate,
  TenantMigrationColumnRelation,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

import { customTableDefaultColumns } from './utils/custom-table-default-column.util';

@Injectable()
export class TenantMigrationRunnerService {
  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
  ) {}

  /**
   * Executes pending migrations for a given workspace
   *
   * @param workspaceId string
   * @returns Promise<TenantMigrationTableAction[]>
   */
  public async executeMigrationFromPendingMigrations(
    workspaceId: string,
  ): Promise<TenantMigrationTableAction[]> {
    const workspaceDataSource =
      await this.tenantDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const pendingMigrations =
      await this.tenantMigrationService.getPendingMigrations(workspaceId);

    if (pendingMigrations.length === 0) {
      return [];
    }

    const flattenedPendingMigrations: TenantMigrationTableAction[] =
      pendingMigrations.reduce((acc, pendingMigration) => {
        return [...acc, ...pendingMigration.migrations];
      }, []);

    const queryRunner = workspaceDataSource?.createQueryRunner();
    const schemaName = this.tenantDataSourceService.getSchemaName(workspaceId);

    // Loop over each migration and create or update the table
    // TODO: Should be done in a transaction
    for (const migration of flattenedPendingMigrations) {
      await this.handleTableChanges(queryRunner, schemaName, migration);
    }

    // Update appliedAt date for each migration
    // TODO: Should be done after the migration is successful
    for (const pendingMigration of pendingMigrations) {
      await this.tenantMigrationService.setAppliedAtForMigration(
        workspaceId,
        pendingMigration,
      );
    }

    await queryRunner.release();

    return flattenedPendingMigrations;
  }

  /**
   * Handles table changes for a given migration
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableMigration TenantMigrationTableChange
   */
  private async handleTableChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableMigration: TenantMigrationTableAction,
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
   * @param columnMigrations TenantMigrationColumnAction[]
   * @returns
   */
  private async handleColumnChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnMigrations?: TenantMigrationColumnAction[],
  ) {
    if (!columnMigrations || columnMigrations.length === 0) {
      return;
    }

    for (const columnMigration of columnMigrations) {
      switch (columnMigration.action) {
        case TenantMigrationColumnActionType.CREATE:
          await this.createColumn(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case TenantMigrationColumnActionType.RELATION:
          await this.createForeignKey(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
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
   * @param migrationColumn TenantMigrationColumnAction
   */
  private async createColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: TenantMigrationColumnCreate,
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
        isNullable: true,
      }),
    );
  }

  private async createForeignKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: TenantMigrationColumnRelation,
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
