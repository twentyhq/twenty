import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { DataSource, QueryRunner, Table } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.service';
import { TenantMigration } from 'src/tenant/metadata/migration-generator/tenant-migration.entity';

import { uuidToBase36 } from './data-source.util';

@Injectable()
export class DataSourceService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private dataSources: Map<string, DataSource> = new Map();

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
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
  public async createWorkspaceSchema(workspaceId: string): Promise<void> {
    const schemaName = this.getSchemaName(workspaceId);

    const queryRunner = this.mainDataSource.createQueryRunner();
    const schemaAlreadyExists = await queryRunner.hasSchema(schemaName);
    if (schemaAlreadyExists) {
      throw new Error(
        `Schema ${schemaName} already exists for workspace ${workspaceId}`,
      );
    }

    await queryRunner.createSchema(schemaName, true);
    await this.createMigrationTable(queryRunner, schemaName);
    await queryRunner.release();

    await this.dataSourceMetadataService.createDataSourceMetadata(
      workspaceId,
      schemaName,
    );
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

    const dataSourcesMetadata =
      await this.dataSourceMetadataService.getDataSourcesMedataFromWorkspaceId(
        workspaceId,
      );

    if (dataSourcesMetadata.length === 0) {
      throw new NotFoundException(
        `We can't find any data source for this workspace id (${workspaceId}).`,
      );
    }

    const dataSourceMetadata = dataSourcesMetadata[0];
    const schema = dataSourceMetadata.schema;

    // Probably not needed as we will ask for the schema name OR store public by default if it's remote
    if (!schema && !dataSourceMetadata.isRemote) {
      throw Error(
        "No schema found for this non-remote data source, we don't want to fallback to public for workspace data sources.",
      );
    }

    const entities =
      await this.entitySchemaGeneratorService.getTypeORMEntitiesByDataSourceId(
        dataSourceMetadata.id,
      );

    const workspaceDataSource = new DataSource({
      // TODO: We should use later dataSourceMetadata.type and use a switch case condition to create the right data source
      url: dataSourceMetadata.url ?? this.environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: ['query'],
      schema,
      entities: {
        TenantMigration,
        ...entities,
      },
    });

    await workspaceDataSource.initialize();

    this.dataSources.set(workspaceId, workspaceDataSource);

    return this.dataSources.get(workspaceId);
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
