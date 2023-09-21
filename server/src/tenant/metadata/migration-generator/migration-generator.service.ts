import { Injectable } from '@nestjs/common';

import { IsNull, QueryRunner, Table, TableColumn } from 'typeorm';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

import {
  Migration,
  MigrationColumn,
  TenantMigration,
} from './tenant-migration.entity';

@Injectable()
export class MigrationGeneratorService {
  constructor(private readonly dataSourceService: DataSourceService) {}

  private async getPendingMigrations(workspaceId: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const tenantMigrationRepository =
      workspaceDataSource.getRepository(TenantMigration);

    return tenantMigrationRepository.find({
      order: { createdAt: 'ASC' },
      where: { appliedAt: IsNull() },
    });
  }

  private async setAppliedAtForMigration(
    workspaceId: string,
    migration: TenantMigration,
  ) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const tenantMigrationRepository =
      workspaceDataSource.getRepository(TenantMigration);

    await tenantMigrationRepository.save({
      id: migration.id,
      appliedAt: new Date(),
    });
  }

  public async executeMigrationFromPendingMigrations(workspaceId: string) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const pendingMigrations = await this.getPendingMigrations(workspaceId);

    const flattenedPendingMigrations: Migration[] = pendingMigrations.reduce(
      (acc, pendingMigration) => {
        return [...acc, ...pendingMigration.migrations];
      },
      [],
    );

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
      await this.setAppliedAtForMigration(workspaceId, pendingMigration);
    });

    return flattenedPendingMigrations;
  }

  private async handleTableChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableMigration: Migration,
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

  private async handleColumnChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnMigrations?: MigrationColumn[],
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

  private async createColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: MigrationColumn,
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
