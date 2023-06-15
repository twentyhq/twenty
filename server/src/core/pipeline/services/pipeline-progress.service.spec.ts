import { Test, TestingModule } from '@nestjs/testing';
import { PipelineProgressService } from './pipeline-progress.service';
import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/prisma-mock/jest-prisma-singleton';

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
