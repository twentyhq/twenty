import { Test, TestingModule } from '@nestjs/testing';

import { UniversalResolver } from './universal.resolver';
import { UniversalService } from './universal.service';

describe('UniversalResolver', () => {
  let resolver: UniversalResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalResolver,
        {
          provide: UniversalService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<UniversalResolver>(UniversalResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
