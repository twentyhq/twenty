import { Test, TestingModule } from '@nestjs/testing';
import { PipelineProgressResolver } from './pipeline-progress.resolver';
import { PipelineProgressService } from '../services/pipeline-progress.service';

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
      ],
    }).compile();

    resolver = module.get<PipelineProgressResolver>(PipelineProgressResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
