import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { CommentService } from 'src/core/comment/services/comment.service';
import { CreateOneCommentGuard } from 'src/guards/create-one-comment.guard';
import { AbilityFactory } from 'src/ability/ability.factory';

import { CommentResolver } from './comment.resolver';

describe('CommentResolver', () => {
  let resolver: CommentResolver;

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentResolver,
        {
          provide: CommentService,
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
      .compile();

    resolver = module.get<CommentResolver>(CommentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
