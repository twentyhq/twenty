import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';

import { TenantMigrationService } from './tenant-migration.service';

describe('TenantMigrationService', () => {
  let service: TenantMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMigrationService,
        {
          provide: DataSourceService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TenantMigrationService>(TenantMigrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
