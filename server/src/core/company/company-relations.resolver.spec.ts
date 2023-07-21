import { Test, TestingModule } from '@nestjs/testing';

import { CommentThreadService } from 'src/core/comment/services/comment-thread.service';
import { CommentService } from 'src/core/comment/services/comment.service';

import { CompanyRelationsResolver } from './company-relations.resolver';
import { CompanyService } from './company.service';

describe('CompanyRelationsResolver', () => {
  let resolver: CompanyRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRelationsResolver,
        {
          provide: CompanyService,
          useValue: {},
        },
        {
          provide: CommentThreadService,
          useValue: {},
        },
        {
          provide: CommentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<CompanyRelationsResolver>(CompanyRelationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
