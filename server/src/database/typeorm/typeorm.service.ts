import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
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
      schema: 'core',
      entities: [User, Workspace, RefreshToken],
    });
  }

  public async getMainDataSource(): Promise<DataSource> {
    return this.mainDataSource;
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
    const debugMode = this.environmentService.isDebugMode();

    const workspaceDataSource = new DataSource({
      url: dataSource.url ?? this.environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: debugMode ? ['query'] : ['error'],
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
   * @param schemaName
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

  public async hasSchema(schemaName: string): Promise<boolean> {
    const queryRunner = this.mainDataSource.createQueryRunner();
    const schemaAlreadyExists = await queryRunner.hasSchema(schemaName);
    await queryRunner.release();
    return schemaAlreadyExists;
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
