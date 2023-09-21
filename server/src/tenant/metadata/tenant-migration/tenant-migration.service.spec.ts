import { Test, TestingModule } from '@nestjs/testing';
import { TenantMigrationService } from './tenant-migration.service';
import { DataSourceService } from '../data-source/data-source.service';

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
