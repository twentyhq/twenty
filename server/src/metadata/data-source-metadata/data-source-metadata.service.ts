import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DataSourceMetadata } from './data-source-metadata.entity';

@Injectable()
export class DataSourceMetadataService {
  constructor(
    @InjectRepository(DataSourceMetadata, 'metadata')
    private readonly dataSourceMetadataRepository: Repository<DataSourceMetadata>,
  ) {}

  async createDataSourceMetadata(workspaceId: string, workspaceSchema: string) {
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

  async getDataSourcesMetadataFromWorkspaceId(workspaceId: string) {
    return this.dataSourceMetadataRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLastDataSourceMetadataFromWorkspaceIdOrFail(workspaceId: string) {
    return this.dataSourceMetadataRepository.findOneOrFail({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }
}
