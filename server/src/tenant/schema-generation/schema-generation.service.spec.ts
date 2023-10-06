import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';

import { SchemaGenerationService } from './schema-generation.service';

describe('SchemaGenerationService', () => {
  let service: SchemaGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaGenerationService,
        {
          provide: DataSourceMetadataService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: EntityResolverService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SchemaGenerationService>(SchemaGenerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
