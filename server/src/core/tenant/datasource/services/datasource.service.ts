import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { CompanyEntity } from 'src/core/tenant/company-v2/company-v2.entity';

@Injectable()
export class DataSourceService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private connectionOptions: PostgresConnectionOptions;
  private dataSources = new Map<string, DataSource>();

  constructor(environmentService: EnvironmentService) {
    this.connectionOptions = {
      url: environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      synchronize: true,
      logging: false,
      schema: 'public',
    };
    this.mainDataSource = new DataSource(this.connectionOptions);
  }

  private uuidToBase36(uuid: string) {
    const hexString = uuid.replace(/-/g, '');
    const base10Number = BigInt('0x' + hexString);
    const base36String = base10Number.toString(36);
    return base36String;
  }

  public getSchemaName(workspaceId: string): string {
    return `workspace_${this.uuidToBase36(workspaceId)}`;
  }

  public async createWorkspaceSchema(workspaceId: string): Promise<string> {
    const schemaName = this.getSchemaName(workspaceId);

    const queryRunner = this.mainDataSource.createQueryRunner();
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

    // await this.runMigrations();

    return schemaName;
  }

  public async connectToWorkspaceDataSource(
    workspaceId: string,
  ): Promise<DataSource | undefined> {
    if (this.dataSources.has(workspaceId)) {
      return this.dataSources.get(workspaceId);
    }

    const schema = this.getSchemaName(workspaceId);

    const newDataSource = new DataSource({
      ...this.connectionOptions,
      schema,
      entities: [CompanyEntity],
    });

    await newDataSource.initialize();

    this.dataSources.set(workspaceId, newDataSource);

    return this.dataSources.get(workspaceId);
  }

  async onModuleInit() {
    await this.mainDataSource.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    await this.mainDataSource.destroy();
  }
}
