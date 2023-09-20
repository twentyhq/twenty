import { Test, TestingModule } from '@nestjs/testing';

import { CustomResolver } from './universal.resolver';

describe('CustomResolver', () => {
  let resolver: CustomResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomResolver],
    }).compile();

    resolver = module.get<CustomResolver>(CustomResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
