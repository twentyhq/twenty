import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from 'src/core/auth/services/token.service';

import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyService } from './api-key.service';

@Module({
  providers: [ApiKeyResolver, ApiKeyService, TokenService, JwtService],
})
export class ApiKeyModule {}
