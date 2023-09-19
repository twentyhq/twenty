import { Test, TestingModule } from '@nestjs/testing';

import { MetadataController } from './metadata.controller';

import { DataSourceService } from './data-source/data-source.service';
import { DataSourceMetadataService } from './data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from './entity-schema-generator/entity-schema-generator.service';

describe('MetadataController', () => {
  let controller: MetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [
        {
          provide: DataSourceService,
          useValue: {},
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

    controller = module.get<MetadataController>(MetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
