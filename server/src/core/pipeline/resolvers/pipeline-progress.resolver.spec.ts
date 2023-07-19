import { Test, TestingModule } from '@nestjs/testing';

import { PipelineProgressService } from 'src/core/pipeline/services/pipeline-progress.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { PipelineProgressResolver } from './pipeline-progress.resolver';

describe('PipelineProgressResolver', () => {
  let resolver: PipelineProgressResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineProgressResolver,
        {
          provide: PipelineProgressService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineProgressResolver>(PipelineProgressResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
