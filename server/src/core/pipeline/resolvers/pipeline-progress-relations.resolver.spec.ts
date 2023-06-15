import { Test, TestingModule } from '@nestjs/testing';
import { PipelineProgressRelationsResolver } from './pipeline-progress-relations.resolver';
import { PipelineStageService } from '../services/pipeline-stage.service';
import { PipelineService } from '../services/pipeline.service';

describe('PipelineProgressRelationsResolver', () => {
  let resolver: PipelineProgressRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineProgressRelationsResolver,
        {
          provide: PipelineStageService,
          useValue: {},
        },
        {
          provide: PipelineService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineProgressRelationsResolver>(
      PipelineProgressRelationsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
