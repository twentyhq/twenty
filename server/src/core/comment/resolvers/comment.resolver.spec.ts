import { Test, TestingModule } from '@nestjs/testing';

import { CommentService } from 'src/core/comment/services/comment.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { CommentResolver } from './comment.resolver';

describe('CommentResolver', () => {
  let resolver: CommentResolver;

  beforeEach(async () => {
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
    }).compile();

    resolver = module.get<CommentResolver>(CommentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
