import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { PipelineStageService } from './pipeline-stage.service';

describe('PipelineStageService', () => {
  let service: PipelineStageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineStageService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PipelineStageService>(PipelineStageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
