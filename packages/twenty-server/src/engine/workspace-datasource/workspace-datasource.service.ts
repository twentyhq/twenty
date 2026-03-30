import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type DataSource, type EntityManager, Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  WorkspaceDataSourceException,
  WorkspaceDataSourceExceptionCode,
} from 'src/engine/workspace-datasource/exceptions/workspace-datasource.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class WorkspaceDataSourceService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly featureFlagService: FeatureFlagService,
    private readonly dataSourceService: DataSourceService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private assertDDLNotLocked(): void {
    if (this.twentyConfigService.get('WORKSPACE_SCHEMA_DDL_LOCKED')) {
      throw new WorkspaceDataSourceException({
        message:
          'Workspace schema DDL changes are locked. This is typically set during hot upgrades.',
        code: WorkspaceDataSourceExceptionCode.DDL_LOCKED,
      });
    }
  }

  public async checkSchemaExists(workspaceId: string) {
    const isDataSourceMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_DATASOURCE_MIGRATED,
      workspaceId,
    );

    if (isDataSourceMigrated) {
      const workspace = await this.workspaceRepository.findOne({
        select: ['databaseSchema'],
        where: { id: workspaceId },
      });

      return isNonEmptyString(workspace?.databaseSchema);
    }

    const dataSources =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    return dataSources.length > 0;
  }

  /**
   *
   * Create a new DB schema for a workspace
   *
   * @param workspaceId
   * @returns
   */
  public async createWorkspaceDBSchema(workspaceId: string): Promise<string> {
    this.assertDDLNotLocked();

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.createSchema(schemaName, true);

      return schemaName;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   *
   * Delete a DB schema for a workspace
   *
   * @param workspaceId
   * @returns
   */
  public async deleteWorkspaceDBSchema(workspaceId: string): Promise<void> {
    this.assertDDLNotLocked();

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      await queryRunner.dropSchema(schemaName, true, true);
    } finally {
      await queryRunner.release();
    }
  }

  public async executeRawQuery(
    _query: string,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    _parameters: any[] = [],
    _workspaceId: string,
    _transactionManager?: EntityManager,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
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
