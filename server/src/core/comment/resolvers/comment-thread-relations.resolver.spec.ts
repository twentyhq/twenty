import { Test, TestingModule } from '@nestjs/testing';
import { CommentThreadRelationsResolver } from './comment-thread-relations.resolver';
import { CommentService } from '../services/comment.service';
import { CommentThreadTargetService } from '../services/comment-thread-target.service';

describe('CommentThreadRelationsResolver', () => {
  let resolver: CommentThreadRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentThreadRelationsResolver,
        {
          provide: CommentService,
          useValue: {},
        },
        {
          provide: CommentThreadTargetService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CommentThreadRelationsResolver>(
      CommentThreadRelationsResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
