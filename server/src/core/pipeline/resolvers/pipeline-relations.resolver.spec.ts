import { Test, TestingModule } from '@nestjs/testing';
import { PipelineRelationsResolver } from './pipeline-relations.resolver';
import { PipelineStageService } from '../services/pipeline-stage.service';

describe('PipelineRelationsResolver', () => {
  let resolver: PipelineRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineRelationsResolver,
        {
          provide: PipelineStageService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<PipelineRelationsResolver>(PipelineRelationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
