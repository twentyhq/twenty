import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { ObjectMetadataService } from './object-metadata.service';

describe('ObjectMetadataService', () => {
  let service: ObjectMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectMetadataService,
        {
          provide: getRepositoryToken(ObjectMetadata, 'metadata'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ObjectMetadataService>(ObjectMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
