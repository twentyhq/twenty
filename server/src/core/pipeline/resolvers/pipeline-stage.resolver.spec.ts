import { Test, TestingModule } from '@nestjs/testing';

import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { PipelineStageResolver } from './pipeline-stage.resolver';

describe('PipelineStageResolver', () => {
  let resolver: PipelineStageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineStageResolver,
        {
          provide: PipelineStageService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineStageResolver>(PipelineStageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
