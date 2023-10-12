import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AbilityFactory } from 'src/ability/ability.factory';
import { TokenService } from 'src/core/auth/services/token.service';

import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyResolver', () => {
  let resolver: ApiKeyResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyResolver,
        { provide: ApiKeyService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: AbilityFactory, useValue: {} },
      ],
    }).compile();
    resolver = module.get<ApiKeyResolver>(ApiKeyResolver);
  });
  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
