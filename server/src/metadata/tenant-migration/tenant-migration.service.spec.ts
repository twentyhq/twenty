import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TenantMigrationService } from './tenant-migration.service';
import { TenantMigration } from './tenant-migration.entity';

describe('TenantMigrationService', () => {
  let service: TenantMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMigrationService,
        {
          provide: getRepositoryToken(TenantMigration, 'metadata'),
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
