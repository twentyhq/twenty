import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

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
        {
          provide: EnvironmentService,
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
