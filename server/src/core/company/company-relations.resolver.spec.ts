import { Test, TestingModule } from '@nestjs/testing';

import { CommentService } from 'src/core/comment/comment.service';
import { ActivityService } from 'src/core/activity/services/activity.service';

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
          provide: ActivityService,
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
