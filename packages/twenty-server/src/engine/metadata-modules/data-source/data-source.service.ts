import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindManyOptions, Repository } from 'typeorm';

import { DataSourceEntity } from './data-source.entity';

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceMetadataRepository: Repository<DataSourceEntity>,
  ) {}

  async createDataSourceMetadata(
    workspaceId: string,
    workspaceSchema: string,
  ): Promise<DataSourceEntity> {
    // TODO: Double check if this is the correct way to do this
    const dataSource = await this.dataSourceMetadataRepository.findOne({
      where: { workspaceId },
    });

    if (dataSource) {
      return dataSource;
    }

    return this.dataSourceMetadataRepository.save({
      workspaceId,
      schema: workspaceSchema,
    });
  }

  async getManyDataSourceMetadata(
    options: FindManyOptions<DataSourceEntity> = {},
  ): Promise<DataSourceEntity[]> {
    return this.dataSourceMetadataRepository.find(options);
  }

  async getDataSourcesMetadataFromWorkspaceId(
    workspaceId: string,
  ): Promise<DataSourceEntity[]> {
    return this.dataSourceMetadataRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLastDataSourceMetadataFromWorkspaceId(
    workspaceId: string,
  ): Promise<DataSourceEntity | null> {
    return this.dataSourceMetadataRepository.findOne({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLastDataSourceMetadataFromWorkspaceIdOrFail(
    workspaceId: string,
  ): Promise<DataSourceEntity> {
    return this.dataSourceMetadataRepository.findOneOrFail({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(workspaceId: string): Promise<void> {
    await this.dataSourceMetadataRepository.delete({ workspaceId });
  }
}
