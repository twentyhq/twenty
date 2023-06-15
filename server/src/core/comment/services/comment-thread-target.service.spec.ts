import { Test, TestingModule } from '@nestjs/testing';
import { CommentThreadTargetService } from './comment-thread-target.service';
import { PrismaService } from 'src/database/prisma.service';

describe('CommentThreadTargetService', () => {
  let service: CommentThreadTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentThreadTargetService,
        {
          provide: PrismaService,
          useValue: {},
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
