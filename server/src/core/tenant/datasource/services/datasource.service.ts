import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource, EntitySchema } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { dataSourceEntity } from 'src/core/tenant/datasource/entities/data-source.entity';
import { objectMetadataEntity } from 'src/core/tenant/datasource/entities/object-metadata';
import { fieldMetadataEntity } from 'src/core/tenant/datasource/entities/field-metadata.entity';
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
      entities: [dataSourceEntity, fieldMetadataEntity, objectMetadataEntity],
    });
  }

  public getSchemaName(workspaceId: string): string {
    return `workspace_${uuidToBase36(workspaceId)}`;
  }

  public async createWorkspaceSchema(workspaceId: string) {
    const schemaName = this.getSchemaName(workspaceId);

    const queryRunner = this.mainDataSource.createQueryRunner();
    await queryRunner.createSchema(schemaName, true);
    await queryRunner.release();

    await this.insertNewDataSourceIntoMetadata(workspaceId, schemaName);

    const workspaceDataSource = await this.connectToWorkspaceDataSource(
      workspaceId,
    );

    await workspaceDataSource?.synchronize();
  }

  private async insertNewDataSourceIntoMetadata(
    workspaceId: string,
    workspaceSchema: string,
  ) {
    await this.metadataDataSource
      ?.createQueryBuilder()
      .insert()
      .into(dataSourceEntity)
      .values({
        workspace_id: workspaceId,
        type: 'postgres',
        schema: workspaceSchema,
      })
      .execute();
  }

  public async connectToWorkspaceDataSource(
    workspaceId: string,
  ): Promise<DataSource | undefined> {
    if (this.dataSources.has(workspaceId)) {
      return this.dataSources.get(workspaceId);
    }

    const schema = this.getSchemaName(workspaceId);

    const metadata = await this.fetchMetadata(workspaceId);

    const entities = this.convertMetadataToEntities(metadata);

    const workspaceDataSource = new DataSource({
      ...this.connectionOptions,
      schema,
      entities: entities,
      synchronize: true, // TODO: remove this in production
    });

    await workspaceDataSource.initialize();

    await workspaceDataSource.synchronize();

    this.dataSources.set(workspaceId, workspaceDataSource);

    return this.dataSources.get(workspaceId);
  }

  public async fetchMetadata(workspaceId: string) {
    const dataSource = await this.metadataDataSource
      ?.createQueryBuilder()
      .select('data_source')
      .from(dataSourceEntity, 'data_source')
      .where('data_source.workspace_id = :workspaceId', { workspaceId })
      .orderBy('data_source.created_at', 'DESC')
      .getOneOrFail();

    const objectRepository =
      this.metadataDataSource.getRepository(objectMetadataEntity);

    return await objectRepository
      .createQueryBuilder('object_metadata')
      .select(['object_metadata.id', 'object_metadata.name'])
      .leftJoinAndSelect('object_metadata.fields', 'field')
      .where('object_metadata.data_source_id = :dataSourceId', {
        dataSourceId: dataSource?.id,
      })
      .getMany();
  }

  private convertMetadataToEntities(metadata) {
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
