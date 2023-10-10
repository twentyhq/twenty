import { Test, TestingModule } from '@nestjs/testing';

import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';

import { SchemaBuilderService } from './schema-builder.service';

describe('SchemaBuilderService', () => {
  let service: SchemaBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemaBuilderService,
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
