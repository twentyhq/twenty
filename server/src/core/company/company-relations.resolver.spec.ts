import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRelationsResolver } from './company-relations.resolver';
import { CompanyService } from './company.service';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';

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
