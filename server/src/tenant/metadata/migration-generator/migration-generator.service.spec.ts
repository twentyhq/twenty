import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';
import { TenantMigrationService } from 'src/tenant/metadata/tenant-migration/tenant-migration.service';

import { MigrationGeneratorService } from './migration-generator.service';

describe('MigrationGeneratorService', () => {
  let service: MigrationGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationGeneratorService,
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: TenantMigrationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MigrationGeneratorService>(MigrationGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
