import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';

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
          provide: DataSourceMetadataService,
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
