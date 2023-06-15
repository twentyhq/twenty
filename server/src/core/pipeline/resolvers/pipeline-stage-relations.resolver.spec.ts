import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStageRelationsResolver } from './pipeline-stage-relations.resolver';
import { PipelineProgressService } from '../services/pipeline-progress.service';

describe('PipelineStageRelationsResolver', () => {
  let resolver: PipelineStageRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineStageRelationsResolver,
        {
          provide: PipelineProgressService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineStageRelationsResolver>(
      PipelineStageRelationsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
