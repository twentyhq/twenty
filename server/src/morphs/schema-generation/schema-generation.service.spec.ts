import { Test, TestingModule } from '@nestjs/testing';

import { SchemaGenerationService } from './schema-generation.service';

describe('SchemaGenerationService', () => {
  let service: SchemaGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaGenerationService],
    }).compile();

    service = module.get<SchemaGenerationService>(SchemaGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
