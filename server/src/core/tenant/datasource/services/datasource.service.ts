import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource, EntitySchema } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceMetadata } from 'src/core/tenant/datasource/entities/data-source-metadata.entity';
import { ObjectMetadata } from 'src/core/tenant/datasource/entities/object-metadata';
import { FieldMetadata } from 'src/core/tenant/datasource/entities/field-metadata.entity';
import { baseColumns } from 'src/core/tenant/datasource/entities/base.entity';
import {
  convertFieldTypeToPostgresType,
  sanitizeColumnName,
  uuidToBase36,
} from 'src/core/tenant/datasource/utils/datasource.util';

@Injectable()
export class DataSourceService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private metadataDataSource: DataSource;
  private connectionOptions: PostgresConnectionOptions;
  private dataSources = new Map<string, DataSource>();

  constructor(environmentService: EnvironmentService) {
    this.connectionOptions = {
      url: environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: false,
      schema: 'public',
    };
    this.mainDataSource = new DataSource(this.connectionOptions);
    this.metadataDataSource = new DataSource({
      ...this.connectionOptions,
      schema: 'metadata',
      synchronize: true, // TODO: remove this in production
      entities: [DataSourceMetadata, ObjectMetadata, FieldMetadata],
    });
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

    await this.insertNewDataSourceMetadata(workspaceId, schemaName);
  }

  /**
   * Inserts a new data source
   * @param workspaceId
   * @param workspaceSchema this can be computed from the workspaceId but it won't be the case for remote data sources
   * @returns Promise<void>
   */
  private async insertNewDataSourceMetadata(
    workspaceId: string,
    workspaceSchema: string,
  ): Promise<void> {
    await this.metadataDataSource
      ?.createQueryBuilder()
      .insert()
      .into(DataSourceMetadata)
      .values({
        workspace_id: workspaceId,
        schema: workspaceSchema,
      })
      .execute();
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

    const dataSourceMetadata =
      await this.getLastDataSourceMetadataFromWorkspaceIdOrFail(workspaceId);

    const schema = dataSourceMetadata.schema;

    // Probably not needed as we will ask for the schema name OR store public by default if it's remote
    if (!schema && !dataSourceMetadata.is_remote) {
      throw Error(
        "No schema found for this non-remote data source, we don't want to fallback to public for workspace data sources.",
      );
    }

    const metadata = await this.fetchObjectsAndFieldsFromMetadata(workspaceId);

    const entities = this.convertMetadataToEntities(metadata);

    const workspaceDataSource = new DataSource({
      ...this.connectionOptions,
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
   * Returns the last data source metadata for a given workspaceId
   * In the future we should handle multiple data sources.
   * Most likely the twenty workspace connection and n remote connections should be fetched.
   *
   * @param workspaceId
   * @returns Promise<DataSourceMetadata>
   */
  private async getLastDataSourceMetadataFromWorkspaceIdOrFail(
    workspaceId: string,
  ): Promise<DataSourceMetadata> {
    return this.metadataDataSource
      ?.createQueryBuilder()
      .select('data_source')
      .from(DataSourceMetadata, 'data_source')
      .where('data_source.workspace_id = :workspaceId', { workspaceId })
      .orderBy('data_source.created_at', 'DESC')
      .getOneOrFail();
  }

  /**
   * Returns all the objects and fields for a given workspaceId and the first associated data source metadata registered.
   *
   * @param workspaceId
   * @returns
   */
  public async fetchObjectsAndFieldsFromMetadata(workspaceId: string) {
    const dataSource =
      await this.getLastDataSourceMetadataFromWorkspaceIdOrFail(workspaceId);

    const objectRepository =
      this.metadataDataSource.getRepository(ObjectMetadata);

    return await objectRepository
      .createQueryBuilder('object_metadata')
      .select(['object_metadata.id', 'object_metadata.name'])
      .leftJoinAndSelect('object_metadata.fields', 'field')
      .where('object_metadata.data_source_id = :dataSourceId', {
        dataSourceId: dataSource?.id,
      })
      .getMany();
  }

  /**
   * Converts the metadata to entities that can be interpreted by typeorm.
   * @param metadata
   * @returns EntitySchema[]
   *
   */
  public convertMetadataToEntities(metadata): EntitySchema[] {
    const entities = metadata.map((object) => {
      return new EntitySchema({
        name: object.name,
        columns: {
          ...baseColumns,
          ...object.fields.reduce((columns, field) => {
            return {
              ...columns,
              [sanitizeColumnName(field.name)]: {
                type: convertFieldTypeToPostgresType(field.type),
                nullable: true,
              },
            };
          }, {}),
        },
      });
    });

    return entities;
  }

  async onModuleInit() {
    await this.mainDataSource.initialize();
    await this.metadataDataSource.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    await this.mainDataSource.destroy();
    await this.metadataDataSource.destroy();
  }
}
