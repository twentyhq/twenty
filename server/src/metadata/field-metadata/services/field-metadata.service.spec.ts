import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

import { FieldMetadataService } from './field-metadata.service';

describe('FieldMetadataService', () => {
  let service: FieldMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldMetadataService,
        {
          provide: getRepositoryToken(FieldMetadata, 'metadata'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FieldMetadataService>(FieldMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
