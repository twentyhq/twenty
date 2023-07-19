import { Test, TestingModule } from '@nestjs/testing';

import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { PipelineResolver } from './pipeline.resolver';

describe('PipelineResolver', () => {
  let resolver: PipelineResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineResolver,
        {
          provide: PipelineService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineResolver>(PipelineResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
