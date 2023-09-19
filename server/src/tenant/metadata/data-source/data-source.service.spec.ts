import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.service';

import { DataSourceService } from './data-source.service';

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        {
          provide: EnvironmentService,
          useValue: {
            getPGDatabaseUrl: () => '',
          },
        },
        {
          provide: DataSourceMetadataService,
          useValue: {},
        },
        {
          provide: EntitySchemaGeneratorService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
