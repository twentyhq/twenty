import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource, QueryRunner, Table } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { TenantMigration } from 'src/metadata/tenant-migration/tenant-migration.entity';

import { uuidToBase36 } from './data-source.util';

@Injectable()
export class DataSourceService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private dataSources: Map<string, DataSource> = new Map();

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
  ) {
    this.mainDataSource = new DataSource({
      url: environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: false,
      schema: 'public',
    });
  }

  /**
   * Creates a new schema for a given workspaceId
   * @param workspaceId
   * @returns Promise<void>
   */
  public async createWorkspaceSchema(workspaceId: string): Promise<string> {
    const schemaName = this.getSchemaName(workspaceId);

    const queryRunner = this.mainDataSource.createQueryRunner();
    const schemaAlreadyExists = await queryRunner.hasSchema(schemaName);

    if (schemaAlreadyExists) {
      return schemaName;
    }

    await queryRunner.createSchema(schemaName, true);
    await this.createMigrationTable(queryRunner, schemaName);
    await queryRunner.release();

    await this.dataSourceMetadataService.createDataSourceMetadata(
      workspaceId,
      schemaName,
    );

    return schemaName;
  }

  private async createMigrationTable(
    queryRunner: QueryRunner,
    schemaName: string,
  ) {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_migrations',
        schema: schemaName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'migrations',
            type: 'jsonb',
          },
          {
            name: 'applied_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );
  }

  /**
   * Connects to a workspace data source using the workspace metadata. Returns a cached connection if it exists.
   * @param workspaceId
   * @returns Promise<DataSource | undefined>
   */
  public async connectToWorkspaceDataSource(
    workspaceId: string,
  ): Promise<DataSource | undefined> {
    if (this.dataSources.has(workspaceId)) {
      const cachedDataSource = this.dataSources.get(workspaceId);
      return cachedDataSource;
    }

    // We only want the first one for now, we will handle multiple data sources later with remote datasources.
    // However, we will need to differentiate the data sources because we won't run migrations on remote data sources for example.
    const dataSourceMetadata =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );
    const schema = dataSourceMetadata.schema;

    // Probably not needed as we will ask for the schema name OR store public by default if it's remote
    if (!schema && !dataSourceMetadata.isRemote) {
      throw Error(
        "No schema found for this non-remote data source, we don't want to fallback to public for workspace data sources.",
      );
    }

    const workspaceDataSource = new DataSource({
      // TODO: We should use later dataSourceMetadata.type and use a switch case condition to create the right data source
      url: dataSourceMetadata.url ?? this.environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: ['query'],
      schema,
      entities: {
        TenantMigration,
      },
    });

    await workspaceDataSource.initialize();

    // Set search path to workspace schema for raw queries
    await workspaceDataSource?.query(`SET search_path TO ${schema};`);

    this.dataSources.set(workspaceId, workspaceDataSource);

    return workspaceDataSource;
  }

  /**
   * Disconnects from a workspace data source.
   * @param workspaceId
   * @returns Promise<void>
   *
   */
  public async disconnectFromWorkspaceDataSource(workspaceId: string) {
    if (!this.dataSources.has(workspaceId)) {
      return;
    }

    const dataSource = this.dataSources.get(workspaceId);

    await dataSource?.destroy();

    this.dataSources.delete(workspaceId);
  }

  /**
   *
   * Returns the schema name for a given workspaceId
   * @param workspaceId
   * @returns string
   */
  public getSchemaName(workspaceId: string): string {
    return `workspace_${uuidToBase36(workspaceId)}`;
  }

  async onModuleInit() {
    // Init main data source "default" schema
    await this.mainDataSource.initialize();
  }

  async onModuleDestroy() {
    // Destroy main data source "default" schema
    await this.mainDataSource.destroy();
  }
}
