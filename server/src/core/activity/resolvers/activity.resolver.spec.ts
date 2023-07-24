import { Test, TestingModule } from '@nestjs/testing';

import { ActivityService } from 'src/core/activity/services/activity.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { ActivityResolver } from './activity.resolver';

describe('ActivityResolver', () => {
  let resolver: ActivityResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityResolver,
        {
          provide: ActivityService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<ActivityResolver>(ActivityResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
