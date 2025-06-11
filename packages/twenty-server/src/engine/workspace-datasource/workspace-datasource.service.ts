import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

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
    const dataSource = this.typeormService.getMainDataSource();

    if (!dataSource) {
      throw new Error(`Could not connect to workspace data source`);
    }

    return dataSource;
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
    _query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _parameters: any[] = [],
    _workspaceId: string,
    _transactionManager?: EntityManager,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    throw new PermissionsException(
      'Method not allowed as permissions are not handled at datasource level.',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
    );
  }
}
