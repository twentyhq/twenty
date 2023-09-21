import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

import { UniversalService } from './universal.service';

describe('UniversalService', () => {
  let service: UniversalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalService,
        {
          provide: DataSourceService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UniversalService>(UniversalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
