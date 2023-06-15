import { Test, TestingModule } from '@nestjs/testing';
import { CommentRelationsResolver } from './comment-relations.resolver';
import { CommentService } from '../services/comment.service';

describe('CommentRelationsResolver', () => {
  let resolver: CommentRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRelationsResolver,
        {
          provide: CommentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CommentRelationsResolver>(CommentRelationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
