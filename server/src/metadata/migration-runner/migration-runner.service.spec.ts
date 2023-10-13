import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';

import { MigrationRunnerService } from './migration-runner.service';

describe('MigrationRunnerService', () => {
  let service: MigrationRunnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationRunnerService,
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

    service = module.get<MigrationRunnerService>(MigrationRunnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
