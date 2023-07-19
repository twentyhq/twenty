import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { PipelineProgressService } from './pipeline-progress.service';

describe('PipelineProgressService', () => {
  let service: PipelineProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineProgressService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PipelineProgressService>(PipelineProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
