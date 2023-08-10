import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { ViewSortService } from './view-sort.service';

describe('ViewSortService', () => {
  let service: ViewSortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewSortService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ViewSortService>(ViewSortService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
