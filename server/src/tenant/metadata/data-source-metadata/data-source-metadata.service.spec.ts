import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceMetadataService } from './data-source-metadata.service';

describe('DataSourceMetadataService', () => {
  let service: DataSourceMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSourceMetadataService],
    }).compile();

    service = module.get<DataSourceMetadataService>(DataSourceMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
