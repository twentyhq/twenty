import { Test, TestingModule } from '@nestjs/testing';

import { MetadataService } from './metadata.service';

import { MigrationGeneratorService } from './migration-generator/migration-generator.service';
import { DataSourceService } from './data-source/data-source.service';
import { ObjectMetadataService } from './object-metadata/object-metadata.service';
import { TenantMigrationService } from './tenant-migration/tenant-migration.service';
import { FieldMetadataService } from './field-metadata/field-metadata.service';

describe('MetadataService', () => {
  let service: MetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: MigrationGeneratorService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: TenantMigrationService,
          useValue: {},
        },
        {
          provide: FieldMetadataService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
