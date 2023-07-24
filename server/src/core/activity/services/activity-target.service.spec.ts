import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { ActivityTargetService } from './activity-target.service';

describe('ActivityTargetService', () => {
  let service: ActivityTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityTargetService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ActivityTargetService>(ActivityTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
