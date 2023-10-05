import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';

import { SchemaBuilderService } from './schema-builder.service';

describe('SchemaBuilderService', () => {
  let service: SchemaBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaBuilderService,
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

    service = module.get<SchemaBuilderService>(SchemaBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
