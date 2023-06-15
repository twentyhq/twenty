import { Test, TestingModule } from '@nestjs/testing';
import { PersonRelationsResolver } from './person-relations.resolver';
import { PersonService } from './person.service';
import { CommentThreadService } from '../comment/services/comment-thread.service';
import { CommentService } from '../comment/services/comment.service';

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
          provide: CommentThreadService,
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
