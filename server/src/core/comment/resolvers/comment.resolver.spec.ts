import { Test, TestingModule } from '@nestjs/testing';
import { CommentResolver } from './comment.resolver';
import { CommentService } from '../services/comment.service';
import { CreateOneCommentGuard } from 'src/guards/create-one-comment.guard';
import { CanActivate } from '@nestjs/common';
import { AbilityFactory } from 'src/ability/ability.factory';

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
