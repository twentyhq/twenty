import { Test, TestingModule } from '@nestjs/testing';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

import { EntitySchemaGeneratorService } from './entity-schema-generator.service';

describe('EntitySchemaGeneratorService', () => {
  let service: EntitySchemaGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitySchemaGeneratorService,
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EntitySchemaGeneratorService>(
      EntitySchemaGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
