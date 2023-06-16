import { Test, TestingModule } from '@nestjs/testing';
import { PipelineResolver } from './pipeline.resolver';
import { PipelineService } from '../services/pipeline.service';

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
      ],
    }).compile();

    resolver = module.get<PipelineResolver>(PipelineResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
