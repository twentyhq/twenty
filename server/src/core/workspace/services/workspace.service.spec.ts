import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';
import { PipelineService } from 'src/core/pipeline/services/pipeline.service';
import { PipelineStageService } from 'src/core/pipeline/services/pipeline-stage.service';
import { PersonService } from 'src/core/person/person.service';
import { CompanyService } from 'src/core/company/company.service';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: PipelineService,
          useValue: {},
        },
        {
          provide: PipelineStageService,
          useValue: {},
        },
        {
          provide: PersonService,
          useValue: {},
        },
        {
          provide: CompanyService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
