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

  createDataSourceMetadata(workspaceId: string, workspaceSchema: string) {
    return this.dataSourceMetadataRepository.save({
      workspaceId,
      schema: workspaceSchema,
    });
  }

  getDataSourcesMedataFromWorkspaceId(workspaceId: string) {
    return this.dataSourceMetadataRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }
}
