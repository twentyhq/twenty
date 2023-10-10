import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';

import { FieldMetadataService } from './field-metadata.service';

describe('FieldMetadataService', () => {
  let service: FieldMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldMetadataService,
        {
          provide: getRepositoryToken(FieldMetadata, 'metadata'),
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
          provide: MigrationRunnerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FieldMetadataService>(FieldMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
