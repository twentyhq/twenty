import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStageResolver } from './pipeline-stage.resolver';
import { PipelineStageService } from '../services/pipeline-stage.service';

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
      ],
    }).compile();

    resolver = module.get<PipelineStageResolver>(PipelineStageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
