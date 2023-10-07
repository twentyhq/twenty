import { Injectable } from '@nestjs/common';

import { QueryRunner, Table, TableColumn } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import {
  TenantMigrationTableChange,
  TenantMigrationColumnChange,
} from 'src/metadata/tenant-migration/tenant-migration.entity';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';

@Injectable()
export class MigrationGeneratorService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
  ) {}

  /**
   * Executes pending migrations for a given workspace
   *
   * @param workspaceId string
   * @returns Promise<TenantMigrationTableChange[]>
   */
  public async executeMigrationFromPendingMigrations(
    workspaceId: string,
  ): Promise<TenantMigrationTableChange[]> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const pendingMigrations =
      await this.tenantMigrationService.getPendingMigrations(workspaceId);

    const flattenedPendingMigrations: TenantMigrationTableChange[] =
      pendingMigrations.reduce((acc, pendingMigration) => {
        return [...acc, ...pendingMigration.migrations];
      }, []);

    const queryRunner = workspaceDataSource?.createQueryRunner();
    const schemaName = this.dataSourceService.getSchemaName(workspaceId);

    // Loop over each migration and create or update the table
    // TODO: Should be done in a transaction
    flattenedPendingMigrations.forEach(async (migration) => {
      await this.handleTableChanges(queryRunner, schemaName, migration);
    });

    // Update appliedAt date for each migration
    // TODO: Should be done after the migration is successful
    pendingMigrations.forEach(async (pendingMigration) => {
      await this.tenantMigrationService.setAppliedAtForMigration(
        workspaceId,
        pendingMigration,
      );
    });

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
    tableMigration: TenantMigrationTableChange,
  ) {
    switch (tableMigration.change) {
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
          `Migration table change ${tableMigration.change} not supported`,
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
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
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
   * @param columnMigrations TenantMigrationColumnChange[]
   * @returns
   */
  private async handleColumnChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnMigrations?: TenantMigrationColumnChange[],
  ) {
    if (!columnMigrations || columnMigrations.length === 0) {
      return;
    }

    for (const columnMigration of columnMigrations) {
      switch (columnMigration.change) {
        case 'create':
          await this.createColumn(
            queryRunner,
            schemaName,
            tableName,
            columnMigration,
          );
          break;
        case 'alter':
          throw new Error(
            `Migration column change ${columnMigration.change} not supported`,
          );
        default:
          throw new Error(
            `Migration column change ${columnMigration.change} not supported`,
          );
      }
    }
  }

  /**
   * Creates a column for a given schema, table name, and column migration
   *
   * @param queryRunner QueryRunner
   * @param schemaName string
   * @param tableName string
   * @param migrationColumn TenantMigrationColumnChange
   */
  private async createColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: TenantMigrationColumnChange,
  ) {
    await queryRunner.addColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: migrationColumn.name,
        type: migrationColumn.type,
        isNullable: true,
      }),
    );
  }
}
