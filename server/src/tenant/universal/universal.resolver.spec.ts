import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { UniversalResolver } from './universal.resolver';

describe('UniversalResolver', () => {
  let resolver: UniversalResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalResolver,
        {
          provide: EnvironmentService,
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
