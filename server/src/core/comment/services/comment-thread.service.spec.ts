import { Test, TestingModule } from '@nestjs/testing';
import { CommentThreadService } from './comment-thread.service';
import { PrismaService } from 'src/database/prisma.service';

describe('CommentThreadService', () => {
  let service: CommentThreadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentThreadService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CommentThreadService>(CommentThreadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
