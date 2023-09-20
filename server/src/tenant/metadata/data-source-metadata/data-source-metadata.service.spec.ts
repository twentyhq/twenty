import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DataSourceMetadataService } from './data-source-metadata.service';
import { DataSourceMetadata } from './data-source-metadata.entity';

describe('DataSourceMetadataService', () => {
  let service: DataSourceMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceMetadataService,
        {
          provide: getRepositoryToken(DataSourceMetadata, 'metadata'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DataSourceMetadataService>(DataSourceMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
