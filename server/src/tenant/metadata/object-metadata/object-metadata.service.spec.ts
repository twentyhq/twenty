import { Test, TestingModule } from '@nestjs/testing';

import { ObjectMetadataService } from './object-metadata.service';

describe('ObjectMetadataService', () => {
  let service: ObjectMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObjectMetadataService],
    }).compile();

    service = module.get<ObjectMetadataService>(ObjectMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
