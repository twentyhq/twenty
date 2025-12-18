import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { type DataSource, type EntityManager } from 'typeorm';

import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

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
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.createSchema(schemaName, true);

    await queryRunner.release();

    return schemaName;
  }

  /**
   *
   * Delete a DB schema for a workspace
   *
   * @param workspaceId
   * @returns
   */
  public async deleteWorkspaceDBSchema(workspaceId: string): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.dropSchema(schemaName, true, true);

    await queryRunner.release();
  }

  public async executeRawQuery(
    _query: string,
     
    _parameters: any[] = [],
    _workspaceId: string,
    _transactionManager?: EntityManager,
     
  ): Promise<any> {
    throw new PermissionsException(
      'Method not allowed as permissions are not handled at datasource level.',
      PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      {
        userFriendlyMessage: msg`This operation is not allowed. Please try a different approach or contact support if you need assistance.`,
      },
    );
  }
}
