import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.service';

import { uuidToBase36 } from './data-source.util';

@Injectable()
export class DataSourceService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;

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
    await queryRunner.createSchema(schemaName, true);
    await queryRunner.release();

    await this.dataSourceMetadataService.createDataSourceMetadata(
      workspaceId,
      schemaName,
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
    // if (this.dataSources.has(workspaceId)) {
    //   const cachedDataSource = this.dataSources.get(workspaceId);
    //   return cachedDataSource;
    // }

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
      entities: entities,
      synchronize: true, // TODO: remove this in production
    });

    await workspaceDataSource.initialize();

    return workspaceDataSource;
    // this.dataSources.set(workspaceId, workspaceDataSource);

    // return this.dataSources.get(workspaceId);
  }

  /**
   *
   * Returns the schema name for a given workspaceId
   * @param workspaceId
   * @returns string
   */
  private getSchemaName(workspaceId: string): string {
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
