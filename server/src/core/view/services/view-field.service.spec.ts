import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { ViewFieldService } from './view-field.service';

describe('ViewFieldService', () => {
  let service: ViewFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewFieldService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ViewFieldService>(ViewFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
