import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

import { CommentThreadTargetService } from './comment-thread-target.service';

describe('CommentThreadTargetService', () => {
  let service: CommentThreadTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentThreadTargetService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CommentThreadTargetService>(
      CommentThreadTargetService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
