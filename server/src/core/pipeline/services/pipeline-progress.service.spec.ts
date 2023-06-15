import { Test, TestingModule } from '@nestjs/testing';
import { PipelineProgressService } from './pipeline-progress.service';
import { PrismaService } from 'src/database/prisma.service';

describe('PipelineProgressService', () => {
  let service: PipelineProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineProgressService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PipelineProgressService>(PipelineProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
