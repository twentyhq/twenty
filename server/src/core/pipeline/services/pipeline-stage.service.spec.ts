import { Test, TestingModule } from '@nestjs/testing';
import { PipelineStageService } from './pipeline-stage.service';
import { PrismaService } from 'src/database/prisma.service';

describe('PipelineStageService', () => {
  let service: PipelineStageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineStageService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PipelineStageService>(PipelineStageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
