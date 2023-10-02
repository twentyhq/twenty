import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { EntityResolverService } from './entity-resolver.service';

describe('EntityResolverService', () => {
  let service: EntityResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityResolverService,
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

    service = module.get<EntityResolverService>(EntityResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
