import { Test, TestingModule } from '@nestjs/testing';

import { ViewSortService } from 'src/core/view/services/view-sort.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { ViewSortResolver } from './view-sort.resolver';

describe('ViewSortResolver', () => {
  let resolver: ViewSortResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewSortResolver,
        {
          provide: ViewSortService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<ViewSortResolver>(ViewSortResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
