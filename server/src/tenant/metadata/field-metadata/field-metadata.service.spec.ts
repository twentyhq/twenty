import { Test, TestingModule } from '@nestjs/testing';

import { FieldMetadataService } from './field-metadata.service';

describe('FieldMetadataService', () => {
  let service: FieldMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldMetadataService],
    }).compile();

    service = module.get<FieldMetadataService>(FieldMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
