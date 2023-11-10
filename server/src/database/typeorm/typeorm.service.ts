import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

@Injectable()
export class TypeORMService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private dataSources: Map<string, DataSource> = new Map();

  constructor(private readonly environmentService: EnvironmentService) {
    this.mainDataSource = new DataSource({
      url: environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: false,
      schema: 'public',
    });
  }

  /**
   * Connects to a data source using metadata. Returns a cached connection if it exists.
   * @param dataSource DataSourceEntity
   * @returns Promise<DataSource | undefined>
   */
  public async connectToDataSource(
    dataSource: DataSourceEntity,
  ): Promise<DataSource | undefined> {
    if (this.dataSources.has(dataSource.id)) {
      return this.dataSources.get(dataSource.id);
    }

    const schema = dataSource.schema;

    const workspaceDataSource = new DataSource({
      url: dataSource.url ?? this.environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: ['query'],
      schema,
    });

    await workspaceDataSource.initialize();

    this.dataSources.set(dataSource.id, workspaceDataSource);

    return workspaceDataSource;
  }

  /**
   * Disconnects from a workspace data source.
   * @param dataSourceId
   * @returns Promise<void>
   *
   */
  public async disconnectFromDataSource(dataSourceId: string) {
    if (!this.dataSources.has(dataSourceId)) {
      return;
    }

    const dataSource = this.dataSources.get(dataSourceId);

    await dataSource?.destroy();

    this.dataSources.delete(dataSourceId);
  }

  /**
   * Creates a new schema
   * @param workspaceId
   * @returns Promise<void>
   */
  public async createSchema(schemaName: string): Promise<string> {
    const queryRunner = this.mainDataSource.createQueryRunner();

    await queryRunner.createSchema(schemaName, true);

    await queryRunner.release();

    return schemaName;
  }

  public async deleteSchema(schemaName: string) {
    const queryRunner = this.mainDataSource.createQueryRunner();

    await queryRunner.dropSchema(schemaName, true, true);

    await queryRunner.release();
  }

  async onModuleInit() {
    // Init main data source "default" schema
    await this.mainDataSource.initialize();
  }

  async onModuleDestroy() {
    // Destroy main data source "default" schema
    await this.mainDataSource.destroy();

    // Destroy all workspace data sources
    for (const [, dataSource] of this.dataSources) {
      await dataSource.destroy();
    }
  }
}
