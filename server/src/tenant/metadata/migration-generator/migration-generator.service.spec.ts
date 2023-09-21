import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

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
      ],
    }).compile();

    service = module.get<MigrationGeneratorService>(MigrationGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
