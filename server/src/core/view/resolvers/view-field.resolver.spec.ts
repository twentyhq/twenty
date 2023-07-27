import { Test, TestingModule } from '@nestjs/testing';

import { ViewFieldService } from 'src/core/view/services/view-field.service';

import { ViewFieldResolver } from './view-field.resolver';
import { AbilityFactory } from 'src/ability/ability.factory';

describe('ViewFieldResolver', () => {
  let resolver: ViewFieldResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewFieldResolver,
        {
          provide: ViewFieldService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<ViewFieldResolver>(ViewFieldResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
