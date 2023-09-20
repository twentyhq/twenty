import { Test, TestingModule } from '@nestjs/testing';

import { MigrationGeneratorService } from './migration-generator.service';

describe('MigrationGeneratorService', () => {
  let service: MigrationGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MigrationGeneratorService],
    }).compile();

    service = module.get<MigrationGeneratorService>(MigrationGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
