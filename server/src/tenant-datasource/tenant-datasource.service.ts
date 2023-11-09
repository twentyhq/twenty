import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class TenantDataSourceService {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly typeormService: TypeORMService,
  ) {}

  /**
   *
   * Connect to the workspace data source
   *
   * @param workspaceId
   * @returns
   */
  public async connectToWorkspaceDataSource(
    workspaceId: string,
  ): Promise<DataSource> {
    const { id, schema } =
      await this.dataSourceMetadataService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );
    return this.connectToSchemaDataSource(schema, id);
  }

  /**
   *
   * Connect to the schema data source
   *
   * @params schema, dataSourceId
   * @returns
   */
  public async connectToSchemaDataSource(
    schema: string,
    dataSourceId?: string,
  ): Promise<DataSource> {
    const dataSource = await this.typeormService.connectToDataSource({
      id: dataSourceId,
      schema,
    });
    if (!dataSource) {
      throw new Error(
        `Could not connect to workspace data source for schema ${schema}`,
      );
    }
    return dataSource;
  }

  /**
   *
   * Create a new DB schema for a workspace
   *
   * @param workspaceId
   * @returns
   */
  public async createWorkspaceDBSchema(workspaceId: string): Promise<string> {
    const schemaName = this.getSchemaName(workspaceId);

    return await this.typeormService.createSchema(schemaName);
  }

  /**
   *
   * Check if workspace has a schema
   *
   * @param workspaceId
   * @returns
   */
  public async hasSchema(workspaceId: string): Promise<boolean> {
    const schemaName = this.getSchemaName(workspaceId);
    return await this.typeormService.hasSchema(schemaName);
  }

  /**
   *
   * Delete a DB schema for a workspace
   *
   * @param workspaceId
   * @returns
   */
  public async deleteWorkspaceDBSchema(workspaceId: string): Promise<void> {
    const schemaName = this.getSchemaName(workspaceId);

    return await this.typeormService.deleteSchema(schemaName);
  }

  /**
   *
   * Get the schema name for a workspace
   *
   * @param workspaceId
   * @returns string
   */
  public getSchemaName(workspaceId: string): string {
    return `workspace_${this.uuidToBase36(workspaceId)}`;
  }

  /**
   *
   * Convert a uuid to base36
   *
   * @param uuid
   * @returns string
   */
  private uuidToBase36(uuid: string): string {
    let devId = false;

    if (uuid.startsWith('twenty-')) {
      devId = true;
      // Clean dev uuids (twenty-)
      uuid = uuid.replace('twenty-', '');
    }
    const hexString = uuid.replace(/-/g, '');
    const base10Number = BigInt('0x' + hexString);
    const base36String = base10Number.toString(36);

    return `${devId ? 'twenty_' : ''}${base36String}`;
  }
}
