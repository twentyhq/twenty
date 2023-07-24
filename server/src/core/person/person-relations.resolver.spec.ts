import { Test, TestingModule } from '@nestjs/testing';

import { CommentService } from 'src/core/comment/comment.service';
import { ActivityService } from 'src/core/activity/services/activity.service';

import { PersonRelationsResolver } from './person-relations.resolver';
import { PersonService } from './person.service';

describe('PersonRelationsResolver', () => {
  let resolver: PersonRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonRelationsResolver,
        {
          provide: PersonService,
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

    resolver = module.get<PersonRelationsResolver>(PersonRelationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
