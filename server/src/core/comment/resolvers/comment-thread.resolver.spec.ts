import { Test, TestingModule } from '@nestjs/testing';
import { CommentThreadResolver } from './comment-thread.resolver';
import { CommentThreadService } from '../services/comment-thread.service';

describe('CommentThreadResolver', () => {
  let resolver: CommentThreadResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentThreadResolver,
        {
          provide: CommentThreadService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CommentThreadResolver>(CommentThreadResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
