import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource, QueryRunner, Table } from 'typeorm';
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
    await queryRunner.createSchema(schemaName, true);

    // await this.runMigrations();
    await this.setupCompaniesTable(queryRunner, schemaName);

    await queryRunner.release();
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

  private async setupCompaniesTable(queryRunner: QueryRunner, schema: string) {
    // This should be done by migrations
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        schema,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );
  }

  async onModuleInit() {
    await this.mainDataSource.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    await this.mainDataSource.destroy();
  }
}
