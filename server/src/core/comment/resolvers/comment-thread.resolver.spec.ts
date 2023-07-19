import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { CommentThreadService } from 'src/core/comment/services/comment-thread.service';
import { CreateOneCommentGuard } from 'src/guards/create-one-comment.guard';
import { CreateOneCommentThreadGuard } from 'src/guards/create-one-comment-thread.guard';
import { AbilityFactory } from 'src/ability/ability.factory';

import { CommentThreadResolver } from './comment-thread.resolver';

describe('CommentThreadResolver', () => {
  let resolver: CommentThreadResolver;

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

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
    })
      .overrideGuard(CreateOneCommentGuard)
      .useValue(mockGuard)
      .overrideGuard(CreateOneCommentThreadGuard)
      .useValue(mockGuard)
      .compile();

    resolver = module.get<CommentThreadResolver>(CommentThreadResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
