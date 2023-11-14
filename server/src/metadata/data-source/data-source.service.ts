import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DataSourceEntity } from './data-source.entity';

@Injectable()
export class DataSourceService {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceMetadataRepository: Repository<DataSourceEntity>,
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

  async delete(workspaceId: string) {
    await this.dataSourceMetadataRepository.delete({ workspaceId });
  }
}
