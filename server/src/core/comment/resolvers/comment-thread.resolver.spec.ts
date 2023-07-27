import { Test, TestingModule } from '@nestjs/testing';

import { CommentThreadService } from 'src/core/comment/services/comment-thread.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { CommentThreadResolver } from './comment-thread.resolver';

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
        {
          provide: AbilityFactory,
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
