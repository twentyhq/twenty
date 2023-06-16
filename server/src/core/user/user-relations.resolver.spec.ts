import { Test, TestingModule } from '@nestjs/testing';
import { UserRelationsResolver } from './user-relations.resolver';
import { UserService } from './user.service';

describe('UserRelationsResolver', () => {
  let resolver: UserRelationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRelationsResolver,
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<UserRelationsResolver>(UserRelationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
