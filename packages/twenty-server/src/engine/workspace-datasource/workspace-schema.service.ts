import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { type DataSource, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceDataSourceException,
  WorkspaceDataSourceExceptionCode,
} from 'src/engine/workspace-datasource/exceptions/workspace-datasource.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Injectable()
export class WorkspaceSchemaService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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
}
