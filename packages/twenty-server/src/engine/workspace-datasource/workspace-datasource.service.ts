import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeormService: TypeORMService,
  ) {}

  /**
   *
   * Connect to the workspace data source
   *
   * @param workspaceId
   * @returns
   */
  public async connectToMainDataSource(): Promise<DataSource> {
    return this.typeormService.getMainDataSource();
  }

  public async checkSchemaExists(workspaceId: string) {
    const dataSource =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    return dataSource.length > 0;
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
   * Note: This is assuming that the workspace only has one schema but we should prefer querying the metadata table instead.
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

  public async executeRawQuery(
    query: string,
    parameters: any[] = [],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<any> {
    try {
      if (transactionManager) {
        return await transactionManager.query(query, parameters);
      }
      const dataSource = await this.connectToMainDataSource();

      return await dataSource.query(query, parameters);
    } catch (error) {
      throw new Error(
        `Error executing raw query for workspace ${workspaceId}: ${error.message}`,
      );
    }
  }
}
