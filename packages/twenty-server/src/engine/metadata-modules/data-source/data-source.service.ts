import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindManyOptions, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  DataSourceException,
  DataSourceExceptionCode,
} from 'src/engine/metadata-modules/data-source/data-source.exception';

import { DataSourceEntity } from './data-source.entity';

// @deprecated - This service is being deprecated. During the transition,
// writes go to both the dataSource table and workspace table (dual-write).
// Reads should progressively migrate to use workspace.databaseSchema
// or the deterministic getWorkspaceSchemaName(workspaceId) utility.
@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly dataSourceMetadataRepository: Repository<DataSourceEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async createDataSourceMetadata(
    workspaceId: string,
    workspaceSchema: string,
  ): Promise<DataSourceEntity> {
    const dataSource = await this.dataSourceMetadataRepository.findOne({
      where: { workspaceId },
    });

    // Dual-write: always keep workspace.databaseSchema in sync
    await this.workspaceRepository.update(workspaceId, {
      databaseSchema: workspaceSchema,
    });

    if (dataSource) {
      return dataSource;
    }

    return this.dataSourceMetadataRepository.save({
      workspaceId,
      schema: workspaceSchema,
    });
  }

  // @deprecated - Use workspace.activationStatus or workspace.databaseSchema
  // to check if a workspace has been initialized instead.
  async getManyDataSourceMetadata(
    options: FindManyOptions<DataSourceEntity> = {},
  ): Promise<DataSourceEntity[]> {
    return this.dataSourceMetadataRepository.find(options);
  }

  // @deprecated - Use workspace.databaseSchema or
  // getWorkspaceSchemaName(workspaceId) instead.
  async getDataSourcesMetadataFromWorkspaceId(
    workspaceId: string,
  ): Promise<DataSourceEntity[]> {
    return this.dataSourceMetadataRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  // @deprecated - Use workspace.databaseSchema or
  // getWorkspaceSchemaName(workspaceId) instead.
  async getLastDataSourceMetadataFromWorkspaceId(
    workspaceId: string,
  ): Promise<DataSourceEntity | null> {
    return this.dataSourceMetadataRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  // @deprecated - Use workspace.databaseSchema or
  // getWorkspaceSchemaName(workspaceId) instead.
  async getLastDataSourceMetadataFromWorkspaceIdOrFail(
    workspaceId: string,
  ): Promise<DataSourceEntity> {
    try {
      return this.dataSourceMetadataRepository.findOneOrFail({
        where: { workspaceId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new DataSourceException(
        `Data source not found for workspace ${workspaceId}: ${error}`,
        DataSourceExceptionCode.DATA_SOURCE_NOT_FOUND,
      );
    }
  }

  async delete(workspaceId: string): Promise<void> {
    await this.dataSourceMetadataRepository.delete({ workspaceId });

    // Dual-write: clear workspace.databaseSchema on delete
    await this.workspaceRepository.update(workspaceId, {
      databaseSchema: null,
    });
  }
}
