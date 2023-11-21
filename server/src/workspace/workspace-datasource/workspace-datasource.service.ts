import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
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
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );
    const dataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );
    if (!dataSource) {
      throw new Error(
        `Could not connect to workspace data source for workspace ${workspaceId}`,
      );
    }
    return dataSource;
  }

  /**
   *
   * Connect to the main schema data source
   *
   * @returns
   */
  public async connectToMainSchemaDataSource(): Promise<DataSource> {
    return await this.typeORMService.getMainDataSource();
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

    return await this.typeORMService.createSchema(schemaName);
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
    return await this.typeORMService.hasSchema(schemaName);
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

    return await this.typeORMService.deleteSchema(schemaName);
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
