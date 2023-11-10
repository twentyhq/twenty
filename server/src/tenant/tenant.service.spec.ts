import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

import { TenantService } from './tenant.service';

import { ResolverFactory } from './resolver-builder/resolver.factory';
import { GraphQLSchemaFactory } from './schema-builder/graphql-schema.factory';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: GraphQLSchemaFactory,
          useValue: {},
        },
        {
          provide: ResolverFactory,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
